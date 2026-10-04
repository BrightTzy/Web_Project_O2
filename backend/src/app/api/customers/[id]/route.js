import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Customer } from '@/models';

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const resolvedParams = await params;
    await Customer.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
