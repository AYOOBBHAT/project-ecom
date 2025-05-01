import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB, disconnectDB } from '@/lib/db';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  status: { type: String, required: true },
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if ((decoded as any).role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await connectDB();

    if (req.method === 'GET') {
      const orders = await Order.find();
      res.status(200).json(orders);
    } else if (req.method === 'PUT') {
      const { id, status } = req.body;
      const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
      res.status(200).json(updatedOrder);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  } finally {
    await disconnectDB();
  }
}