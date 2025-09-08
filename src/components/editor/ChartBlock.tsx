// src/components/editor/ChartBlock.tsx
'use client';

import { trpc } from '@/lib/trpc';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChartBlockProps {
  block: {
    id: string;
    content: any;
  };
  dataset: any[];
  isDatasetError: boolean;
}

export function ChartBlock({ block, dataset, isDatasetError }: ChartBlockProps) {
  const [xAxisKey, setXAxisKey] = useState<string>(block.content?.xKey || '');
  const [yAxisKey, setYAxisKey] = useState<string>(block.content?.yKey || '');
  
  const updateContentMutation = trpc.updateBlockContent.useMutation();

  const headers = useMemo(() => {
    if (dataset && dataset.length > 0) {
      return Object.keys(dataset[0]);
    }
    return [];
  }, [dataset]);

  const handleAxisChange = (axis: 'x' | 'y', value: string) => {
    const newContent = { ...block.content, [`${axis}Key`]: value };
    if (axis === 'x') setXAxisKey(value);
    if (axis === 'y') setYAxisKey(value);
    updateContentMutation.mutate({ blockId: block.id, content: newContent });
  };

  if (isDatasetError) return <div className="text-destructive p-4 text-center">Error loading dataset. Please check the file and upload again.</div>;
  if (!dataset || dataset.length === 0) return <div className='p-4 text-center text-muted-foreground'>No data found in the linked dataset.</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">X-Axis</label>
          <Select value={xAxisKey} onValueChange={(value) => handleAxisChange('x', value)}>
            <SelectTrigger><SelectValue placeholder="Select a column" /></SelectTrigger>
            <SelectContent>
              {headers.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Y-Axis</label>
          <Select value={yAxisKey} onValueChange={(value) => handleAxisChange('y', value)}>
            <SelectTrigger><SelectValue placeholder="Select a column" /></SelectTrigger>
            <SelectContent>
              {headers.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="h-80 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataset} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip 
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
              }}
            />
            <Bar dataKey={yAxisKey} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}