import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '@/components/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Clock, CheckCircle, CreditCard } from 'lucide-react';
import StatCard from '@/components/StatCard';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalPrice: number;
  createdAt: string;
  documentName: string;
}

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
  completedOrders: number;
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user stats
      const statsResponse = await api.get('/users/stats');
      setStats(statsResponse.data.data);
      
      // Fetch recent orders
      const ordersResponse = await api.get('/orders/recent');
      setRecentOrders(ordersResponse.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
          <p className="text-gray-600">Here's an overview of your print orders</p>
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
            title="Total Spent" 
            value={`₹${stats.totalSpent}`}
            icon={<CreditCard size={24} />}
          />
          
          <StatCard 
            title="Completed Orders" 
            value={stats.completedOrders}
            icon={<CheckCircle size={24} />}
          />
        </div>
        
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <FileText className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
            <Link to="/user/orders">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell className="truncate max-w-[200px]">{order.documentName}</TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>₹{order.totalPrice}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No orders found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;
