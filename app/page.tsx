// app/page.tsx
import { DashboardLayout } from "@/components/dashboard-layout";
import { SummaryCards } from "@/components/summary-cards";
import { MonthlyChart } from "@/components/monthly-chart";
import { CategoryChart } from "@/components/category-chart";
import { TransactionList } from "@/components/transaction-list";
import { ITransaction, CategoryType } from "@/types";
import dbConnect from "@/lib/mongodb";
import { Transaction } from "@/models/schema";
import { Types } from 'mongoose';

// MongoDB document with ObjectId
interface MongoDBDocument {
  _id: Types.ObjectId;
  [key: string]: any;
}

// Make this page dynamic to avoid caching
export const dynamic = 'force-dynamic';

// app/page.tsx (snippet)
async function getTransactions(): Promise<ITransaction[]> {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 }).lean();

    return transactions.map((transaction) => {
      // Convert MongoDB document to a properly typed object
      const typedTransaction = transaction as unknown as MongoDBDocument;
      
      return {
        _id: typedTransaction._id.toString(),
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
        category: transaction.category as CategoryType,
        type: (transaction.type === 'income' || transaction.type === 'expense') ? transaction.type : undefined,
        createdAt: transaction.createdAt instanceof Date ? transaction.createdAt.toISOString() : transaction.createdAt,
        updatedAt: transaction.updatedAt instanceof Date ? transaction.updatedAt.toISOString() : transaction.updatedAt,
      };
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

async function getStats() {
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
          income: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0]}, "$amount", 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0]}, "$amount", 0]
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Get category-wise data for pie chart (only expenses)
    const categoryData = await Transaction.aggregate([
      {
        $match: { amount: { $lt: 0 } }
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: { $abs: "$amount" } }
        }
      }
    ]);
    
    // Format monthly data for charts
    const formattedMonthlyData = monthlyData.map(item => ({
      name: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      income: item.income,
      expense: Math.abs(item.expense)
    }));
    
    // Format category data for charts
    const formattedCategoryData = categoryData.map(item => ({
      name: item._id,
      value: item.totalAmount
    }));
    
    return {
      monthlyData: formattedMonthlyData,
      categoryData: formattedCategoryData,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      monthlyData: [],
      categoryData: [],
    };
  }
}

export default async function Home() {
  const transactions = await getTransactions();
  const { monthlyData, categoryData } = await getStats();
  
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial activity
        </p>
      </div>
      
      <div className="space-y-6">
        <SummaryCards transactions={transactions} />
        
        <div className="grid gap-6 md:grid-cols-2">
          <MonthlyChart data={monthlyData} />
          <CategoryChart data={categoryData} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <TransactionList 
            transactions={transactions.slice(0, 5) || []} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
}