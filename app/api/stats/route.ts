// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { Transaction, CATEGORIES } from '../../../models/schema';

export async function GET() {
  try {
    await dbConnect();
    
    // Get monthly data for the chart
    const monthlyData = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Get category-wise data for pie chart
    const categoryData = await Transaction.aggregate([
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);
    
    // Get total expenses
    const totalExpenses = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    
    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5);
    
    // Format monthly data for charts
    const formattedMonthlyData = monthlyData.map(item => ({
      name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      amount: item.totalAmount
    }));
    
    // Format category data for charts
    const formattedCategoryData = categoryData.map(item => ({
      name: item._id,
      value: Math.abs(item.totalAmount)
    }));
    
    return NextResponse.json({
      monthlyData: formattedMonthlyData,
      categoryData: formattedCategoryData,
      totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      recentTransactions
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}