// app/transactions/page.tsx
import { DashboardLayout } from "@/components/dashboard-layout";
import { TransactionList } from "@/components/transaction-list";
import { AddTransactionButton } from "@/components/add-transaction-button";
import { ITransaction } from "@/types";
import dbConnect from "@/lib/mongodb";
import { Transaction } from "@/models/schema";

// Make this page dynamic to avoid caching
export const dynamic = 'force-dynamic';

async function getTransactions(): Promise<ITransaction[]> {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 }).lean();
    
    // Convert MongoDB _id to string for serialization
    return transactions.map(transaction => ({
      ...transaction,
      _id: transaction._id.toString(),
    }));
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