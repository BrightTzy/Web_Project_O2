import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Shipment, AuditLog } from '@/models';

export async function GET() {
  await dbConnect();
  try {
    // Populate relationships to get detailed info rather than just IDs
    const shipments = await Shipment.find({})
      .populate('warehouseId', 'name')
      .populate('customerId', 'name email')
      .populate('productId', 'name sku price')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: shipments });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const shipment = await Shipment.create(body);
    
    // Create Audit Log automatically
    await AuditLog.create({
      action: 'CREATE_SHIPMENT',
      details: `Shipment ${shipment._id} created.`
    });

    return NextResponse.json({ success: true, data: shipment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
