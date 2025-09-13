// src/components/viewer/ChartView.tsx
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';

interface ChartViewProps {
  data: any[];
  content: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function ChartView({ data, content }: ChartViewProps) {
  const { xKey, yKey, chartType } = content;

  if (!xKey || !yKey) {
    return (
      <div className="p-4 border rounded-lg text-muted-foreground">
        Chart is not configured. Please select X and Y axes in the editor.
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey={xKey} stroke="hsl(var(--foreground))" />
            <YAxis stroke="hsl(var(--foreground))" />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Line type="monotone" dataKey={yKey} stroke="hsl(var(--primary))" />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={80} fill="hsl(var(--primary))" label>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
            />
          </PieChart>
        );
      case 'scatter':
        return (
          <ScatterChart>
            <CartesianGrid stroke="hsl(var(--border))" />
            <XAxis type="number" dataKey={xKey} name={xKey} stroke="hsl(var(--foreground))" />
            <YAxis type="number" dataKey={yKey} name={yKey} stroke="hsl(var(--foreground))" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Scatter name="A school" data={data} fill="hsl(var(--primary))" />
          </ScatterChart>
        );
      default:
        return (
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
        );
    }
  }

  return (
    <div className="h-96 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}