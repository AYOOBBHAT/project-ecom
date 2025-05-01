import { NextResponse } from 'next/server';
import Product from '../../../../models/Product';
import connectDB from '../../../../lib/db';

export async function GET() {
  await connectDB();

  const products = await Product.find();
  return NextResponse.json(products, { status: 200 });
}

export async function POST(req: Request) {
  await connectDB();

  const { name, description, price, category, stock, image } = await req.json();

  if (!name || !description || !price || !category || !stock || !image) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const newProduct = new Product({
    name,
    description,
    price,
    category,
    stock,
    image,
  });

  await newProduct.save();

  return NextResponse.json({ message: 'Product added successfully' }, { status: 201 });
}