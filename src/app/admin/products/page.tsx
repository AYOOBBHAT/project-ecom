"use client";

import { useState, useEffect } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  imagePath?: string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<{ name: string; price: string; description: string; stock: string; image: File | null }>({ name: '', price: '', description: '', stock: '', image: null });

  useEffect(() => {
    async function fetchProducts() {
      const response = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setProducts(data);
    }
    fetchProducts();
  }, []);

  async function handleAddProduct() {
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('description', newProduct.description);
    formData.append('stock', newProduct.stock);
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }

    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
    const data = await response.json();
    setProducts([...products, data]);
    setNewProduct({ name: '', price: '', description: '', stock: '', image: null });
  }

  async function handleDeleteProduct(id: string) {
    await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ id }),
    });
    setProducts(products.filter((product) => product._id !== id));
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Product Management</h1>
      <div>
        <h2>Add New Product</h2>
        <input
          type="text"
          placeholder="Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Stock"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
        />
        <input
          type="file"
          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files?.[0] || null })}
        />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>
      <div>
        <h2>Product List</h2>
        <ul>
          {products.map((product) => (
            <li key={product._id}>
              {product.name} - ${product.price}
              {product.imagePath && <img src={product.imagePath} alt={product.name} style={{ width: '50px' }} />}
              <button onClick={() => handleDeleteProduct(product._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}