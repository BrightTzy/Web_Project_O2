import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Shipment, AuditLog } from '@/models';

export async function PATCH(request, { params }) {
  await dbConnect();
  try {
    const resolvedParams = await params;
    const body = await request.json();
    
    // Update the shipment status
    const shipment = await Shipment.findByIdAndUpdate(resolvedParams.id, { status: body.status }, { new: true });
    
    // Log this critical status change to the Audit Log
    await AuditLog.create({
      action: 'UPDATE_SHIPMENT_STATUS',
      details: `Shipment ${shipment._id} status changed to ${body.status}.`
    });

    return NextResponse.json({ success: true, data: shipment });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
