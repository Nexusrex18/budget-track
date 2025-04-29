// components/monthly-chart.tsx
"use client"

import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MonthlyChartProps {
  data: Array<{
    name: string;
    income: number;
    expense: number;
  }>;
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  // Format data for display
  const chartData = data;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px]">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Bar dataKey="income" fill="#4ade80" name="Income" />
                <Bar dataKey="expense" fill="#f87171" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}