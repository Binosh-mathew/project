import MessageCenter from '@/components/messaging/MessageCenter';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  CreditCard, 
  TrendingUp,
  Calendar,
  Store as StoreIcon
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Store {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  storeId: string;
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalUsers: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>(user?.storeId || 'all');
  const [stores, setStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchStores();
    fetchDashboardData();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(intervalId);
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const response = await api.get('/stores');
      setStores(response.data.data);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError('Failed to fetch stores');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats
      const statsResponse = await api.get(`/analytics/stats?storeId=${selectedStore}`);
      setStats(statsResponse.data.data);
      
      // Fetch recent orders
      const ordersResponse = await api.get(`/orders/recent?storeId=${selectedStore}`);
      setRecentOrders(ordersResponse.data.data);
      
      // Fetch revenue data
      const revenueResponse = await api.get(`/analytics/revenue?storeId=${selectedStore}`);
      setRevenueData(revenueResponse.data.data);
      
      // Fetch orders data
      const ordersDataResponse = await api.get(`/analytics/orders?storeId=${selectedStore}`);
      setOrdersData(ordersDataResponse.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Store Selection */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Overview of print shop operations and metrics</p>
          </div>
          {/* Only show store selector for super admin */}
          {user?.role === 'admin' && !user?.storeId && (
            <div className="flex items-center gap-2">
              <StoreIcon className="h-5 w-5" />
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders}
            icon={<FileText size={24} />}
          />
          
          <StatCard 
            title="Pending Orders" 
            value={stats.pendingOrders}
            icon={<Clock size={24} />}
          />
          
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue}`}
            icon={<CreditCard size={24} />}
          />
          
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers}
            icon={<Users size={24} />}
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <TrendingUp className="h-5 w-5 mr-2" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#9b87f5"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="h-5 w-5 mr-2" />
                Orders by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ordersData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>₹{order.totalPrice}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Activity Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calendar className="h-5 w-5 mr-2" />
              Activity Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 italic text-center py-6">
              Activity calendar will be implemented in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
