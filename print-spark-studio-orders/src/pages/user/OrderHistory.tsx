import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '@/components/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Search } from 'lucide-react';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, type Order } from '@/services/api';

const OrderHistory = () => {
  const { user } = useAuth();
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Fetch user orders from backend
          const response = await apiService.getUserOrders(user.id);
          const userOrdersList: Order[] = response.data.data;
          setUserOrders(userOrdersList.sort((a: Order, b: Order) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
          setFilteredOrders(userOrdersList.sort((a: Order, b: Order) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(userOrders);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = userOrders.filter(order => 
        order.documentName.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, userOrders]);

  // Function to get special paper info from files
  const getPaperAndBindingInfo = (order: Order) => {
    if (!order.files || order.files.length === 0) return { paper: 'Normal A4', binding: 'None' };
    const specialPapers = order.files
      .filter((file: any) => file.specialPaper && file.specialPaper !== 'none')
      .map((file: any) => file.specialPaper);
    const bindingTypes = order.files
      .filter((file: any) => file.binding && file.binding.type && file.binding.type !== 'none')
      .map((file: any) => file.binding.type);
    return {
      paper: specialPapers.length > 0 
        ? specialPapers.join(', ') 
        : 'Normal A4',
      binding: bindingTypes.length > 0 
        ? bindingTypes.map((type: string) => type.replace('Binding', '')).join(', ') 
        : 'None'
    };
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-gray-600 mt-1">View and track your print orders</p>
          </div>
          <Link to="/user/new-order">
            <Button className="bg-primary hover:bg-primary-500">New Order</Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Your Orders</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading your orders...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Document</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Copies</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Paper</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const { paper } = getPaperAndBindingInfo(order);
                      return (
                        <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">#{order.id}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <FileText size={16} className="text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                                {order.documentName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {order.copies}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {paper}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {order.colorType === 'color' ? 'Color' : 'B&W'}
                            {order.doubleSided ? ', Double-sided' : ''}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">
                            ₹{order.totalPrice}
                          </td>
                          <td className="py-3 px-4">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/user/orders/${order.id}`}>
                                <Button variant="ghost" size="sm" className="text-primary h-8">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No orders found</p>
                {searchQuery ? (
                  <p className="text-sm text-gray-400">Try a different search term</p>
                ) : (
                  <Link to="/user/new-order">
                    <Button className="mt-4 bg-primary hover:bg-primary-500">
                      Create your first order
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default OrderHistory;
