import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB, disconnectDB } from '@/lib/db';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req: NextApiRequest, file: Express.Multer["File"], cb: (error: Error | null, destination: string) => void) => {
      cb(null, path.join(process.cwd(), 'public/uploads'));
    },
    filename: (req: NextApiRequest, file: Express.Multer["File"], cb: (error: Error | null, filename: string) => void) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

interface MulterRequest extends NextApiRequest {
  file?: Express.Multer["File"];
}

const uploadMiddleware = upload.single('image');

export default async function handler(req: MulterRequest, res: NextApiResponse) {
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
      const products = await Product.find();
      res.status(200).json(products);
    } else if (req.method === 'POST') {
      uploadMiddleware(req, res, async (err: any) => {
        if (err) {
          return res.status(500).json({ error: 'Image upload failed' });
        }
        const { name, price, description, stock } = req.body;
        const image = req.file;

        if (!image) {
          return res.status(400).json({ message: 'Image is required' });
        }

        const uploadResult = await cloudinary.uploader.upload(image.path, {
          folder: 'ecommerce/products',
        });

        const newProduct = new Product({
          name,
          price,
          description,
          stock,
          imagePath: uploadResult.secure_url,
        });

        await newProduct.save();
        res.status(201).json(newProduct);
      });
    } else if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
      res.status(200).json(updatedProduct);
    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      await Product.findByIdAndDelete(id);
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  } finally {
    await disconnectDB();
  }
}