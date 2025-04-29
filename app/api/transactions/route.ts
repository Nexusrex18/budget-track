// app/api/transactions/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import { Transaction } from '../../../models/schema';

export async function GET() {
  try {
    await dbConnect();
    const transactions = await Transaction.find({}).sort({ date: -1 });
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}