import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your admin account information</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={user?.name || ''}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Store Name
                  </Label>
                  <Input 
                    id="store" 
                    value={user?.storeName || 'No store assigned'}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Contact the developer team to update your profile information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile; 