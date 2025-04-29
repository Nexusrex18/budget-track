// models/schema.ts
import mongoose, { Schema } from 'mongoose';
import { ITransaction, IBudget, CATEGORIES, CategoryType } from '../types';

// Transaction Schema
const TransactionSchema: Schema = new Schema(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      default: 'Other',
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: false, // Optional, as per ITransaction
    },
  },
  { timestamps: true }
);

// Budget Schema
const BudgetSchema: Schema = new Schema({
  category: {
    type: String,
    required: true,
    enum: CATEGORIES,
  },
  amount: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
});

// Check if models are already defined to prevent overwriting during hot reloads
export const Transaction =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export const Budget =
  mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);