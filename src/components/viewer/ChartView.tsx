// src/components/viewer/ChartView.tsx
'use client'; // This component must be a client component for Recharts

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartViewProps {
  data: any[];
  content: any;
}

export function ChartView({ data, content }: ChartViewProps) {
  const { xKey, yKey } = content;

  if (!xKey || !yKey) {
    return (
      <div className="p-4 border rounded-lg text-muted-foreground">
        Chart is not configured. Please select X and Y axes in the editor.
      </div>
    );
  }

  return (
    <div className="h-96 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} stroke="hsl(var(--foreground))" />
          <YAxis stroke="hsl(var(--foreground))" />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
            }}
          />
          <Bar dataKey={yKey} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}