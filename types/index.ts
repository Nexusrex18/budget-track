// types/index.ts
// Define predefined categories
export const CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Health & Medical',
    'Personal Care',
    'Education',
    'Travel',
    'Gifts & Donations',
    'Investments',
    'Income',
    'Other',
  ] as const;
  
  export type CategoryType = typeof CATEGORIES[number];
  
  // Transaction interface
  export interface ITransaction {
    _id: string;
    amount: number;
    description: string;
    date: Date | string;
    category: CategoryType;
    type?: "income" | "expense";
    createdAt: Date | string;
    updatedAt: Date | string;
  }
  
  // Budget interface
  export interface IBudget {
    _id: string;
    category: CategoryType;
    amount: number;
    month: number; // 1-12
    year: number;
  }