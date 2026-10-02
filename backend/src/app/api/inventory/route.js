import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Inventory, Warehouse } from '@/models';

export async function GET() {
  await dbConnect();
  try {
    const inventory = await Inventory.find({})
      .populate('productId')
      .populate('warehouseId')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: inventory });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const addedQuantity = Number(body.quantity);

    // Fetch the target warehouse to enforce capacity
    const warehouse = await Warehouse.findById(body.warehouseId);
    if (!warehouse) {
      return NextResponse.json({ error: 'Warehouse not found' }, { status: 404 });
    }

    // Sum all current inventory sitting inside this warehouse
    const allInventoryInWarehouse = await Inventory.find({ warehouseId: body.warehouseId });
    const currentTotal = allInventoryInWarehouse.reduce((sum, item) => sum + item.quantity, 0);

    // Reject the request if it breaks the capacity limit
    if (currentTotal + addedQuantity > warehouse.capacity) {
      const availableSpace = warehouse.capacity - currentTotal;
      return NextResponse.json({ 
        error: `Capacity Exceeded! ${warehouse.name} has a maximum capacity of ${warehouse.capacity}. There is only space for ${availableSpace > 0 ? availableSpace : 0} more units.` 
      }, { status: 400 });
    }

    // Add stock or create new record
    const existing = await Inventory.findOne({ productId: body.productId, warehouseId: body.warehouseId });
    if (existing) {
      existing.quantity += addedQuantity;
      await existing.save();
      return NextResponse.json({ success: true, data: existing }, { status: 200 });
    } else {
      const inventory = await Inventory.create(body);
      return NextResponse.json({ success: true, data: inventory }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
