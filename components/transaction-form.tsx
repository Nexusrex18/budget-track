// components/transaction-form.tsx
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ITransaction, CATEGORIES } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Partial<ITransaction>;
}

// components/transaction-form.tsx
export function TransactionForm({
  isOpen,
  onClose,
  transaction,
}: TransactionFormProps) {
  const router = useRouter();
  const isEditing = !!transaction?._id;
  
  const [formData, setFormData] = useState({
    amount: transaction?.amount || 0,
    description: transaction?.description || "",
    date: transaction?.date ? new Date(transaction.date) : new Date(),
    category: transaction?.category || "Other",
    type: transaction?.amount && transaction.amount < 0 ? "expense" : "income",
  });
  
  const [errors, setErrors] = useState({
    amount: "",
    description: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const validateField = (name: string, value: any) => {
    switch (name) {
      case "amount":
        if (value <= 0) return "Amount must be greater than 0";
        if (value > 1000000) return "Amount is too large";
        return "";
      case "description":
        return value.trim() ? "" : "Description is required";
      default:
        return "";
    }
  };
  
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: validateField(field, value) });
  };
  
  const validateForm = () => {
    const newErrors = {
      amount: validateField("amount", Math.abs(formData.amount)),
      description: validateField("description", formData.description),
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };
  
  const isFormValid = () => {
    return !Object.values(errors).some(error => error) && 
           Math.abs(formData.amount) > 0 && 
           formData.description.trim() !== "";
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const adjustedAmount = formData.type === "expense" ? -Math.abs(formData.amount) : Math.abs(formData.amount);
      
      const url = isEditing 
        ? `/api/transactions/${transaction._id}`
        : "/api/transactions";
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData, 
          amount: adjustedAmount,
          date: formData.date.toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save transaction");
      }
      
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                handleChange("type", value as "income" | "expense")
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3">
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={Math.abs(formData.amount)}
                onChange={(e) =>
                  handleChange("amount", parseFloat(e.target.value) || 0)
                }
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <div className="col-span-3">
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleChange("description", e.target.value)
                }
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                handleChange("category", value as typeof formData.category)
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) =>
                      handleChange("date", date || new Date())
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !isFormValid()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}