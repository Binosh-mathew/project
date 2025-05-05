import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  FileText, 
  Search, 
  Calendar,
  User,
  Store,
  ArrowDown,
  ArrowUp,
  X
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { apiService, Order, Store as StoreType } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import OrderStatusBadge from '@/components/OrderStatusBadge';

const ManageOrders = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order;
    direction: 'ascending' | 'descending';
  }>({
    key: 'createdAt',
    direction: 'descending',
  });

  // Fetch orders using React Query
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiService.getOrders().then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
  });

  // Fetch stores using React Query
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: () => apiService.getStores().then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) => 
      apiService.updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order updated",
        description: "The order has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order.",
        variant: "destructive",
      });
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order deleted",
        description: "The order has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete order.",
        variant: "destructive",
      });
    },
  });

  // Apply search filter and sorting
  const filteredOrders = React.useMemo(() => {
    let result = [...orders];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.documentName.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      );
    }
    
    result.sort((a, b) => {
      if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'ascending'
          ? new Date(a[sortConfig.key]).getTime() - new Date(b[sortConfig.key]).getTime()
          : new Date(b[sortConfig.key]).getTime() - new Date(a[sortConfig.key]).getTime();
      }
      
      return sortConfig.direction === 'ascending'
        ? (a[sortConfig.key] as string).localeCompare(b[sortConfig.key] as string)
        : (b[sortConfig.key] as string).localeCompare(a[sortConfig.key] as string);
    });
    
    return result;
  }, [orders, searchQuery, sortConfig]);

  const handleSort = (key: keyof Order) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    });
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: newStatus }
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrderMutation.mutate(orderId);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Error loading orders</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manage Orders</h1>
            <p className="text-gray-600 mt-1">View and manage all print orders</p>
          </div>
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
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer"
                      onClick={() => handleSort('documentName')}
                    >
                      <div className="flex items-center">
                        Document
                        {sortConfig.key === 'documentName' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortConfig.key === 'status' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === 'createdAt' && (
                          sortConfig.direction === 'ascending' ? (
                            <ArrowUp className="ml-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="ml-1 h-4 w-4" />
                          )
                        )}
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{order.documentName}</td>
                        <td className="py-3 px-4 text-sm">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 mr-2"
                            onClick={() => handleOrderClick(order)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found</p>
                        {searchQuery && (
                          <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Order Details</DialogTitle>
                <DialogDescription>
                  View and manage order information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary-100 text-primary flex items-center justify-center">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedOrder.documentName}</p>
                          <p className="text-sm text-gray-500">Order ID: {selectedOrder.id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Created on {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Store className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Store: {stores.find(s => s.id === selectedOrder.storeId)?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Current Status:</span>
                        <OrderStatusBadge status={selectedOrder.status} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {(['pending', 'processing', 'completed', 'cancelled'] as const).map((status) => (
                          <Button
                            key={status}
                            variant={selectedOrder.status === status ? 'default' : 'outline'}
                            className="w-full"
                            onClick={() => handleStatusChange(selectedOrder.id, status)}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteOrder(selectedOrder.id)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Delete Order
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ManageOrders;
