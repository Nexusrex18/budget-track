// app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb'; // Fixed import path
import { Transaction } from '@/models/schema';
import { ITransaction, CategoryType } from '@/types';
import { Types } from 'mongoose';

// MongoDB document with ObjectId
interface MongoDBDocument {
  _id: Types.ObjectId;
  [key: string]: any;
}

export async function GET(): Promise<NextResponse<ITransaction[] | { error: string }>> {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 }).lean();

    const serializedTransactions: ITransaction[] = transactions.map((transaction) => {
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

    return NextResponse.json(serializedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<ITransaction | { error: string }>> {
  try {
    const body = await request.json();
    await dbConnect();

    // Validate request body
    if (!body.amount || !body.description || !body.date || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create(body);
    const typedTransaction = transaction as unknown as MongoDBDocument;
    
    const serializedTransaction: ITransaction = {
      _id: typedTransaction._id.toString(),
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date.toISOString(),
      category: transaction.category as CategoryType,
      type: (transaction.type === 'income' || transaction.type === 'expense') ? transaction.type : undefined,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };

    return NextResponse.json(serializedTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}