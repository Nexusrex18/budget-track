// components/category-chart.tsx
"use client"

import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface CategoryChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function CategoryChart({ data }: CategoryChartProps) {
  // Colors for different categories
  const COLORS = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#f59e0b", // amber
    "#10b981", // emerald
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#f43f5e", // rose
    "#84cc16", // lime
    "#6366f1", // indigo
    "#d946ef", // fuchsia
    "#0ea5e9", // sky
    "#14b8a6", // teal
    "#a855f7", // purple
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px]">
          {data.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                  }
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}