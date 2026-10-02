import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Product } from '@/models';

export async function DELETE(request, { params }) {
  await dbConnect();
  try {
    const resolvedParams = await params;
    await Product.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
