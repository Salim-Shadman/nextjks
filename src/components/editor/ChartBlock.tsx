// src/components/editor/ChartBlock.tsx
'use client';

import { trpc } from '@/lib/trpc';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '@/components/ui/skeleton';

interface ChartBlockProps {
  projectId: string;
  block: {
    id: string;
    content: any;
  };
}

export function ChartBlock({ projectId, block }: ChartBlockProps) {
  const [xAxisKey, setXAxisKey] = useState<string>(block.content?.xKey || '');
  const [yAxisKey, setYAxisKey] = useState<string>(block.content?.yKey || '');

  // Fetch the parsed dataset from our tRPC backend
  const { data: dataset, isLoading, isError } = trpc.getProjectDataset.useQuery({ projectId });
  const updateContentMutation = trpc.updateBlockContent.useMutation();

  // Get the column headers from the dataset once it's loaded
  const headers = useMemo(() => {
    if (dataset && dataset.length > 0) {
      return Object.keys(dataset[0]);
    }
    return [];
  }, [dataset]);

  // Function to save the selected axes to the database
  const handleAxisChange = (axis: 'x' | 'y', value: string) => {
    const newContent = { ...block.content, [`${axis}Key`]: value };
    if (axis === 'x') setXAxisKey(value);
    if (axis === 'y') setYAxisKey(value);
    updateContentMutation.mutate({ blockId: block.id, content: newContent });
  };

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (isError) return <div className="text-destructive">Error loading dataset.</div>;
  if (!dataset || dataset.length === 0) return <div>No data found in the dataset.</div>;

  return (
    <div className="space-y-4">
      {/* Controls for selecting X and Y axes */}
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">X-Axis</label>
          <Select value={xAxisKey} onValueChange={(value) => handleAxisChange('x', value)}>
            <SelectTrigger><SelectValue placeholder="Select a column" /></SelectTrigger>
            <SelectContent>
              {headers.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Y-Axis</label>
          <Select value={yAxisKey} onValueChange={(value) => handleAxisChange('y', value)}>
            <SelectTrigger><SelectValue placeholder="Select a column" /></SelectTrigger>
            <SelectContent>
              {headers.map(header => <SelectItem key={header} value={header}>{header}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* The Chart from Recharts */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataset}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={yAxisKey} fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}