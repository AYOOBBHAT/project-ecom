import { useState, useEffect } from 'react';

interface Order {
  _id: string;
  status: string;
  user: { name: string; email: string };
  total: number;
  address: string;
  paymentMethod: string;
}


export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      const response = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setOrders(data);
    }
    fetchOrders();
  }, []);

  async function handleUpdateOrderStatus(id: string, status: string) {
    const response = await fetch('/api/admin/orders', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ id, status }),
    });
    const updatedOrder = await response.json();
    setOrders(orders.map((order) => (order._id === id ? updatedOrder : order)));
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Order Management</h1>
      <div>
        <h2>Order List</h2>
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              {order._id} - {order.status}
              <select
                value={order.status}
                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}