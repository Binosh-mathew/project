import React, { useState, useEffect } from 'react';
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
  Users, 
  Search, 
  User as UserIcon,
  Mail,
  Calendar,
  FileText,
  ArrowDown,
  ArrowUp,
  Ban
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/services/api';
import type { User } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ManageUsers = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof User;
    direction: 'ascending' | 'descending';
  }>({
    key: 'name',
    direction: 'ascending',
  });

  // Fetch users using React Query
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiService.getUsers().then(res => res.data),
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    },
  });

  // Apply search filter and sorting
  const filteredUsers = React.useMemo(() => {
    let result = [...users];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
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
  }, [users, searchQuery, sortConfig]);

  const handleSort = (key: keyof User) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    });
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading users</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Manage Users</h1>
            <p className="text-gray-600 mt-1">View and manage all users of the print shop</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th 
                      className="text-left py-3 px-4 text-sm font-medium text-gray-500 cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortConfig.key === 'name' && (
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
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        {sortConfig.key === 'email' && (
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
                        Joined Date
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
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                        <td className="py-3 px-4 text-sm">{user.email}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 mr-2"
                            onClick={() => handleUserClick(user)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No users found</p>
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
      
      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-3xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  View and manage user information
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-primary-100 text-primary flex items-center justify-center">
                          <UserIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{selectedUser.name}</p>
                          <p className="text-sm text-gray-500">User ID: {selectedUser.id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{selectedUser.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Joined on {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Delete User
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ManageUsers;
