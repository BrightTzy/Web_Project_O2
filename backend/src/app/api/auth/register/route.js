import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models';
import bcrypt from 'bcrypt';

export async function POST(request) {
  try {
    await dbConnect();
    const { username, password, role } = await request.json();

    const existingUser = await User.findOne({ username });
    if (existingUser) return NextResponse.json({ error: 'Username already exists' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, role: role || 'WAREHOUSE_STAFF' });
    
    return NextResponse.json({ success: true, message: 'User registered successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
