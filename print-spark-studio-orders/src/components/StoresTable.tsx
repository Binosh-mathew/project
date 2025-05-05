import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function StoresTable() {
  const [stores, setStores] = useState([]);

  useEffect(() => {
    api.get('/stores').then(res => setStores(res.data.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Store Name</th>
          <th>Location</th>
          <th>Admin</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {stores.map(store => (
          <tr key={store._id}>
            <td>{store.name}</td>
            <td>{store.location}</td>
            <td>{store.adminId?.name || store.adminId?.email}</td>
            <td>{store.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
