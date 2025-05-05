import OrdersTable from '@/components/OrdersTable';
import StoresTable from '@/components/StoresTable';
import AnalyticsPanel from '@/components/AnalyticsPanel';

export default function Dashboard() {
  return (
    <div>
      <AnalyticsPanel />
      <OrdersTable />
      <StoresTable />
    </div>
  );
}