import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);

      if ((decoded as any).role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }

      res.status(200).json({
        message: 'Welcome to the admin dashboard',
        features: ['Manage Products', 'Manage Users', 'Manage Orders'],
      });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}