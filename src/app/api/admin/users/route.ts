import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB, disconnectDB } from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

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
      const users = await User.find();
      res.status(200).json(users);
    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      await User.findByIdAndDelete(id);
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  } finally {
    await disconnectDB();
  }
}