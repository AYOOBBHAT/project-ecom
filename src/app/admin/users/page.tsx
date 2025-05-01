import { useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await response.json();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  async function handleDeleteUser(id: string) {
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ id }),
    });
    setUsers(users.filter((user) => user._id !== id));
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>User Management</h1>
      <div>
        <h2>User List</h2>
        <ul>
          {users.map((user) => (
            <li key={user._id}>
              {user.email}
              <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}