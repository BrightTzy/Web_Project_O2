import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Product, Warehouse, Shipment, Customer, Inventory } from '@/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  try {
    const productCount = await Product.countDocuments();
    const warehouseCount = await Warehouse.countDocuments();
    const customerCount = await Customer.countDocuments();
    const pendingShipments = await Shipment.countDocuments({ status: 'PENDING' });
    const inTransitShipments = await Shipment.countDocuments({ status: 'IN_TRANSIT' });
    const deliveredShipments = await Shipment.countDocuments({ status: 'DELIVERED' });

    const inventoryItems = await Inventory.find({}).populate('warehouseId');
    let totalStock = 0;
    let lowStockCount = 0;
    
    // Group stock by warehouse
    const stockByWarehouse = {};
    
    inventoryItems.forEach(inv => {
      totalStock += inv.quantity;
      if (inv.quantity < 50) lowStockCount++;
      
      if (inv.warehouseId) {
        const whName = inv.warehouseId.name;
        stockByWarehouse[whName] = (stockByWarehouse[whName] || 0) + inv.quantity;
      }
    });

    const warehouseChartData = Object.keys(stockByWarehouse).map(name => ({
      name,
      stock: stockByWarehouse[name]
    }));

    // Aggregate shipments by their current status
    const shipmentStatuses = await Shipment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCounts = { PENDING: 0, PROCESSING: 0, IN_TRANSIT: 0, DELIVERED: 0, CANCELLED: 0 };
    shipmentStatuses.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    return NextResponse.json({
      success: true,
      data: {
        products: productCount,
        warehouses: warehouseCount,
        customers: customerCount,
        totalStock,
        lowStockCount,
        pendingShipments: statusCounts.PENDING,
        processingShipments: statusCounts.PROCESSING,
        inTransitShipments: statusCounts.IN_TRANSIT,
        deliveredShipments: statusCounts.DELIVERED,
        cancelledShipments: statusCounts.CANCELLED,
        statusCounts,
        chartData: [
          { name: 'Pending', count: statusCounts.PENDING },
          { name: 'Processing', count: statusCounts.PROCESSING },
          { name: 'In Transit', count: statusCounts.IN_TRANSIT },
          { name: 'Delivered', count: statusCounts.DELIVERED },
          { name: 'Cancelled', count: statusCounts.CANCELLED }
        ],
        warehouseChartData
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
