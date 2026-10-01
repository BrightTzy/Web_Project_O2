import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Warehouse } from '@/models';

export async function GET() {
  await dbConnect();
  try {
    const warehouses = await Warehouse.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: warehouses });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const warehouse = await Warehouse.create(body);
    return NextResponse.json({ success: true, data: warehouse }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
