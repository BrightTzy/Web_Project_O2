import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Inventory } from '@/models';

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const resolvedParams = await params;
    await Inventory.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
