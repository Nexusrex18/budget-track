import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Transaction } from '@/models/schema';
import { ITransaction, CategoryType } from '@/types';
import { Document } from 'mongoose';

type LeanTransaction = Document & {
  _id: any;
  amount: number;
  description: string;
  date: Date;
  category: string;
  type?: 'income' | 'expense' | string;  // Updated to include exact types
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params; // Await params to get the id
    const transaction = await Transaction.findById(id).lean() as LeanTransaction;

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const serializedTransaction: ITransaction = {
      _id: transaction._id.toString(),
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.toISOString(),
      category: transaction.category as CategoryType,
      type: (transaction.type === 'income' || transaction.type === 'expense') ? transaction.type : undefined,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };

    return NextResponse.json(serializedTransaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    await dbConnect();
    const { id } = await params; // Await params to get the id

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean() as LeanTransaction;

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const serializedTransaction: ITransaction = {
      _id: updatedTransaction._id.toString(),
      amount: updatedTransaction.amount,
      description: updatedTransaction.description,
      date: updatedTransaction.date.toISOString(),
      category: updatedTransaction.category as CategoryType,
      type: (updatedTransaction.type === 'income' || updatedTransaction.type === 'expense') ? updatedTransaction.type : undefined,
      createdAt: updatedTransaction.createdAt.toISOString(),
      updatedAt: updatedTransaction.updatedAt.toISOString(),
    };

    return NextResponse.json(serializedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params; // Await params to get the id
    const deletedTransaction = await Transaction.findByIdAndDelete(id).lean() as LeanTransaction;

    if (!deletedTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}