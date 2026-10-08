import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/api/') && !path.startsWith('/api/auth/')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role;

      if (role === 'WAREHOUSE_STAFF') {
        if (!path.startsWith('/api/products') && !path.startsWith('/api/inventory') && !path.startsWith('/api/warehouses') && !path.startsWith('/api/stats')) {
           return NextResponse.json({ error: 'Forbidden: Warehouse Staff cannot access this resource' }, { status: 403 });
        }
        if (path.startsWith('/api/warehouses') && request.method !== 'GET') {
           return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }
      }

      if (role === 'LOGISTICS_STAFF') {
        if (!path.startsWith('/api/shipments') && !path.startsWith('/api/customers') && !path.startsWith('/api/warehouses') && !path.startsWith('/api/stats') && !path.startsWith('/api/inventory')) {
           return NextResponse.json({ error: 'Forbidden: Logistics Staff cannot access this resource' }, { status: 403 });
        }
        if (path.startsWith('/api/warehouses') && request.method !== 'GET') {
           return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
        }
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
