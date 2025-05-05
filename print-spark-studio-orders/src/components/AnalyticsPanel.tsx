import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function AnalyticsPanel() {
  const [revenueByStore, setRevenueByStore] = useState([]);
  const [ordersPerStorePerMonth, setOrdersPerStorePerMonth] = useState([]);
  const [mostActiveUsers, setMostActiveUsers] = useState([]);

  useEffect(() => {
    api.get('/orders/revenue-by-store').then(res => setRevenueByStore(res.data.data));
    api.get('/orders/orders-per-store-per-month').then(res => setOrdersPerStorePerMonth(res.data.data));
    api.get('/orders/most-active-users').then(res => setMostActiveUsers(res.data.data));
  }, []);

  // Render your analytics (charts, tables, etc.) using the above state variables
  return (
    <div>
      <h2>Analytics</h2>
      {/* Render analytics here, e.g. as tables or charts */}
      <div>
        <h3>Revenue by Store</h3>
        <ul>
          {revenueByStore.map((item, idx) => (
            <li key={idx}>{item.storeName}: {item.totalRevenue} ({item.orderCount} orders)</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Orders Per Store Per Month</h3>
        <ul>
          {ordersPerStorePerMonth.map((item, idx) => (
            <li key={idx}>{item.storeName} - {item.month}/{item.year}: {item.orderCount} orders</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Most Active Users</h3>
        <ul>
          {mostActiveUsers.map((user, idx) => (
            <li key={idx}>{user.name} ({user.email}): {user.orderCount} orders</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
