import mongoose from 'mongoose';

// User Schema (Role-Based Access Control)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'WAREHOUSE_STAFF', 'LOGISTICS_STAFF'], default: 'WAREHOUSE_STAFF' },
}, { timestamps: true });

// Product Schema (Master Catalog)
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  category: { type: String },
  price: { type: Number, default: 0 },
}, { timestamps: true });

// Warehouse Schema (Physical locations)
const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  capacity: { type: Number, default: 1000 },
}, { timestamps: true });

// Inventory Schema (Tracks product quantities at specific warehouses)
const InventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 10 },
}, { timestamps: true });

// Customer Schema (Recipient profiles)
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  address: { type: String },
}, { timestamps: true });

// Shipment Schema (Outbound logistics)
const ShipmentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, default: 1 },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
}, { timestamps: true });

// AuditLog Schema (Tracks critical system changes)
const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., "UPDATE_INVENTORY", "CREATE_SHIPMENT"
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: String },
}, { timestamps: true });

// Export Models
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Warehouse = mongoose.models.Warehouse || mongoose.model('Warehouse', WarehouseSchema);
export const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
export const Customer = mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
export const Shipment = mongoose.models.Shipment || mongoose.model('Shipment', ShipmentSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
