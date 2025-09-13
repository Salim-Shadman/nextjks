// src/components/editor/ChartBlock.tsx
'use client';

import { trpc } from '@/lib/trpc';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoryBlockType } from '@/lib/types';

interface ChartBlockProps {
  block: StoryBlockType & { type: 'chart' };
  dataset: any[];
  isDatasetError: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ChartBlock({ block, dataset, isDatasetError }: ChartBlockProps) {
  const [xAxisKey, setXAxisKey] = useState<string>(block.content?.xKey || '');
  const [yAxisKey, setYAxisKey] = useState<string>(block.content?.yKey || '');
  const [chartType, setChartType] = useState<string>(block.content?.chartType || 'bar');

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

  const handleChartTypeChange = (value: string) => {
    setChartType(value);
    const newContent = { ...block.content, chartType: value };
    updateContentMutation.mutate({ blockId: block.id, content: newContent });
  }

  if (isDatasetError) return <div className="text-destructive p-4 text-center">Error loading dataset. Please check the file and upload again.</div>;
  if (!dataset || dataset.length === 0) return <div className='p-4 text-center text-muted-foreground'>No data found in the linked dataset.</div>;

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={dataset}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={yAxisKey} stroke="#8884d8" />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={dataset} dataKey={yAxisKey} nameKey={xAxisKey} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
              {dataset.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey={xAxisKey} name={xAxisKey} />
            <YAxis type="number" dataKey={yAxisKey} name={yAxisKey} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="A school" data={dataset} fill="#8884d8" />
          </ScatterChart>
        );
      default:
        return (
          <BarChart data={dataset}>
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
        );
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Chart Type</label>
          <Select value={chartType} onValueChange={handleChartTypeChange}>
            <SelectTrigger><SelectValue placeholder="Select a chart type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="line">Line</SelectItem>
              <SelectItem value="pie">Pie</SelectItem>
              <SelectItem value="scatter">Scatter</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}