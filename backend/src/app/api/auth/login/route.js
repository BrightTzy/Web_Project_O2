import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    await dbConnect();
    const { username, password } = await request.json();

    const user = await User.findOne({ username });
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return NextResponse.json({ success: true, token, role: user.role, username: user.username });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
