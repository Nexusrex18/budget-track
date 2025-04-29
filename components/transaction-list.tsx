// components/transaction-list.tsx
"use client"

import { useState } from "react";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { ITransaction } from "@/types";
import { TransactionForm } from "./transaction-form";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

interface TransactionListProps {
  transactions: ITransaction[];
}

// components/transaction-list.tsx
export function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter();
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  
  const handleEdit = (transaction: ITransaction) => {
    setEditingTransaction(transaction);
  };
  
  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      const response = await fetch(`/api/transactions/${transactionToDelete}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete transaction");
      }
      
      router.refresh();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };
  
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction._id.toString()}>
                  <TableCell>
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}
                    >
                      {formatAmount(transaction.amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction._id.toString())}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction._id.toString()} className="border rounded-md p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transaction.date), "MMM dd, yyyy")}
                  </p>
                  <p className="text-sm">{transaction.category}</p>
                </div>
                <div className="text-right">
                  <p
                    className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}
                  >
                    {formatAmount(transaction.amount)}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(transaction._id.toString())}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {editingTransaction && (
        <TransactionForm
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          transaction={editingTransaction}
        />
      )}
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              transaction from your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}