// components/summary-cards.tsx
"use client"

import { ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ITransaction } from "@/types";

interface SummaryCardsProps {
  transactions: ITransaction[];
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  // Calculate total income, expenses, and balance
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
  const balance = totalIncome - totalExpenses;
  
  // Find top category
  const categoryTotals = transactions.reduce((acc, t) => {
    // Skip income transactions
    if (t.amount >= 0) return acc;
    
    const category = t.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);
  
  let topCategory = "None";
  let topCategoryAmount = 0;
  
  Object.entries(categoryTotals).forEach(([category, amount]) => {
    if (amount > topCategoryAmount) {
      topCategory = category;
      topCategoryAmount = amount;
    }
  });
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">
            Current available balance
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{formatCurrency(totalIncome)}</div>
          <p className="text-xs text-muted-foreground">
            Total income
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            Total expenses
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Spending</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {topCategory !== "None" ? topCategory : "No expenses"}
          </div>
          <p className="text-xs text-muted-foreground">
            {topCategory !== "None" 
              ? `${formatCurrency(topCategoryAmount)}`
              : "No expense data available"
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
}