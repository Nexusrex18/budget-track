// app/transactions/page.tsx
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionList } from "@/components/transaction-list";
import { AddTransactionButton } from "@/components/add-transaction-button";
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

async function getTransactions(): Promise<ITransaction[]> {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 }).lean();
    
    // Properly map all required properties from MongoDB documents to ITransaction objects
    return transactions.map(transaction => {
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
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export default async function TransactionsPage() {
  const transactions = await getTransactions();
  
  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your financial transactions
          </p>
        </div>
        <AddTransactionButton />
      </div>
      
      <TransactionList transactions={transactions} />
    </DashboardLayout>
  );
}