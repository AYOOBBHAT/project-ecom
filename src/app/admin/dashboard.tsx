import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <ul>
        <li>
          <Link href="/admin/products">Manage Products</Link>
        </li>
        <li>
          <Link href="/admin/users">Manage Users</Link>
        </li>
        <li>
          <Link href="/admin/orders">Manage Orders</Link>
        </li>
      </ul>
    </div>
  );
}