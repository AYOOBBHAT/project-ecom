import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import User from '../../../../models/User';
import connectDB from '../../../../lib/db';

export async function POST(req: Request) {
  await connectDB();

  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
}