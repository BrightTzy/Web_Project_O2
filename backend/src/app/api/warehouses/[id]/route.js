import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Warehouse } from '@/models';

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const resolvedParams = await params;
    await Warehouse.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ success: true, message: 'Warehouse deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
