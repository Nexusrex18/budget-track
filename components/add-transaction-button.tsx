// components/add-transaction-button.tsx
"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "./transaction-form";
import { Plus } from "lucide-react";

export function AddTransactionButton() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsFormOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Transaction
      </Button>
      
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}