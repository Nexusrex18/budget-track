// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // Fixed import path
import { Transaction } from '@/models/schema';
import { ITransaction } from '@/types';
import { Types } from 'mongoose';

interface StatsResponse {
  monthlyData: { name: string; amount: number }[];
  categoryData: { name: string; value: number }[];
  totalExpenses: number;
  recentTransactions: ITransaction[];
}

// MongoDB document with ObjectId
interface MongoDBDocument {
  _id: Types.ObjectId;
  [key: string]: any;
}

export async function GET(): Promise<NextResponse<StatsResponse | { error: string }>> {
  try {
    await dbConnect();

    // Get monthly data for the chart
    const monthlyData = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Get category-wise data for pie chart
    const categoryData = await Transaction.aggregate([
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Get total expenses
    const totalExpenses = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Get recent transactions
    const recentTransactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Format monthly data for charts
    const formattedMonthlyData = monthlyData.map((item) => ({
      name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      amount: item.totalAmount,
    }));

    // Format category data for charts
    const formattedCategoryData = categoryData.map((item) => ({
      name: item._id,
      value: Math.abs(item.totalAmount),
    }));

    // Serialize recent transactions
    const serializedTransactions: ITransaction[] = recentTransactions.map((transaction) => {
      // Convert MongoDB document to a properly typed object
      const typedTransaction = transaction as unknown as MongoDBDocument;
      
      return {
        _id: typedTransaction._id.toString(),
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
        category: transaction.category,
        type: transaction.type || undefined,
        createdAt: transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt,
        updatedAt: transaction.updatedAt instanceof Date ? transaction.updatedAt.toISOString() : transaction.updatedAt,
      };
    });

    return NextResponse.json({
      monthlyData: formattedMonthlyData,
      categoryData: formattedCategoryData,
      totalExpenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
      recentTransactions: serializedTransactions,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}