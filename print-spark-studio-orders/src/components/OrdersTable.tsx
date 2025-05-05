import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/orders').then(res => setOrders(res.data.data));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Order ID</th>
          <th>User</th>
          <th>Store</th>
          <th>Status</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order._id}>
            <td>{order._id}</td>
            <td>{order.userId?.name || order.userId?.email}</td>
            <td>{order.storeId?.name}</td>
            <td>{order.status}</td>
            <td>{order.totalAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
