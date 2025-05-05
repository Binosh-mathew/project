import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Edit2, Key } from 'lucide-react';
import { adminApi } from '@/services/adminApi';

interface StoreAdmin {
  _id: string;
  name: string;
  email: string;
  storeId: string;
  storeName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

const StoreAdminManagement = () => {
  const [storeAdmins, setStoreAdmins] = useState<StoreAdmin[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<StoreAdmin | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<StoreAdmin>>({
    name: '',
    email: '',
    status: 'active'
  });
  const [resetPasswordIdentifier, setResetPasswordIdentifier] = useState('');

  // Fetch all store admins
  useEffect(() => {
    fetchStoreAdmins();
  }, []);

  const fetchStoreAdmins = async () => {
    try {
      const res = await adminApi.list();
      setStoreAdmins(res.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch store admins",
        variant: "destructive",
      });
    }
  };

  const handleEditAdmin = (admin: StoreAdmin) => {
    setSelectedAdmin(admin);
    setEditFormData({
      name: admin.name,
      email: admin.email,
      status: admin.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return;
    try {
      await adminApi.update(selectedAdmin._id, editFormData);
      toast({
        title: "Success",
        description: "Store admin updated successfully",
      });
      fetchStoreAdmins();
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update store admin",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this store admin?')) return;
    try {
      await adminApi.delete(adminId);
      toast({
        title: "Success",
        description: "Store admin deleted successfully",
      });
      fetchStoreAdmins();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete store admin",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordIdentifier) {
      toast({
        title: "Error",
        description: "Please enter an email or username",
        variant: "destructive",
      });
      return;
    }
    try {
      await adminApi.resetPassword(resetPasswordIdentifier);
      toast({
        title: "Success",
        description: "Password reset instructions sent successfully",
      });
      setIsResetPasswordDialogOpen(false);
      setResetPasswordIdentifier('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Store Admin Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setIsResetPasswordDialogOpen(true)}
            variant="outline"
            className="mr-2"
          >
            <Key className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storeAdmins.map((admin) => (
              <TableRow key={admin._id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.storeName || admin.storeId}</TableCell>
                <TableCell>{admin.status}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditAdmin(admin)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAdmin(admin._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Admin Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Store Admin</DialogTitle>
              <DialogDescription>
                Update the store admin's information. Changes will be saved immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'inactive' })}
                  className="col-span-3 p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAdmin}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Admin Password</DialogTitle>
              <DialogDescription>
                Enter the email or username of the admin to reset their password. A password reset email will be sent to their registered email address.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="identifier" className="text-right">
                  Email/Username
                </Label>
                <Input
                  id="identifier"
                  value={resetPasswordIdentifier}
                  onChange={(e) => setResetPasswordIdentifier(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter email or username"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword}>Reset Password</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StoreAdminManagement; 