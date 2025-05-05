import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createFileDetails, cleanupFile } from '@/services/fileStorage';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService, type Store } from '@/services/api';
import type { FileDetails } from '@/types/order';
import UserLayout from '@/components/layouts/UserLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  documentName: string;
  documentUrl: string;
  copies: number;
  colorType: 'color' | 'blackAndWhite';
  doubleSided: boolean;
  specialPaper: 'none' | 'glossy' | 'matte' | 'transparent';
  binding: {
    needed: boolean;
    type: 'none' | 'spiralBinding' | 'staplingBinding' | 'hardcoverBinding';
  };
  files?: FileDetails[];
}

const NewOrder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    documentName: '',
    documentUrl: '',
    copies: 1,
    colorType: 'blackAndWhite',
    doubleSided: false,
    specialPaper: 'none',
    binding: {
      needed: false,
      type: 'none'
    }
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ fileDetails: FileDetails; fileId: string } | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>('');

  // Fetch stores using React Query
  const { data: storesData } = useQuery({
    queryKey: ['stores'],
    queryFn: () => apiService.getStores().then(res => res.data),
  });

  const stores = storesData?.data || [];

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiService.createOrder(orderData),
    onSuccess: (response) => {
      const newOrder = response.data.data;
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: "Order created",
        description: `Order #${newOrder.id} has been created successfully.`,
      });
      navigate('/admin/orders');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create order",
        variant: "destructive",
      });
    }
  });

  // Load stored store selection
  useEffect(() => {
    const storedStore = localStorage.getItem('selectedStore');
    if (storedStore) {
      setSelectedStore(storedStore);
    }
  }, []);

  // Cleanup files when component unmounts
  useEffect(() => {
    return () => {
      if (uploadedFile?.fileId) {
        cleanupFile(uploadedFile.fileId);
      }
    };
  }, [uploadedFile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      
      try {
        // Cleanup previous file if it exists
        if (uploadedFile?.fileId) {
          cleanupFile(uploadedFile.fileId);
        }

        // Validate file type
        if (!file.type.match('application/pdf|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
          throw new Error('Please upload a PDF or Word document');
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File size should be less than 10MB');
        }

        const result = await createFileDetails(file);
        setUploadedFile(result);
        
        // Update form data with file details
        setFormData(prev => ({
          ...prev,
          documentName: file.name,
          documentUrl: result.fileId,
          files: [result.fileDetails]
        }));

        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      } catch (error) {
        console.error('Error handling file:', error);
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "There was a problem uploading your file. Please try again.",
          variant: "destructive",
        });
        
        // Reset file input
        e.target.value = '';
        setUploadedFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!uploadedFile) {
        throw new Error('Please upload a document');
      }

      if (!selectedStore) {
        throw new Error('Please select a store before creating an order');
      }

      if (!user) {
        throw new Error('You must be logged in to create an order');
      }

      // Create new order
      const orderData = {
        userId: user.id,
        userName: user.name,
        storeId: selectedStore,
        documentName: formData.documentName,
        documentUrl: uploadedFile.fileId,
        copies: formData.copies,
        colorType: formData.colorType,
        doubleSided: formData.doubleSided,
        status: 'pending' as const,
        totalPrice: formData.copies * (formData.colorType === 'color' ? 5 : 2), // Simple price calculation
        files: [{
          ...uploadedFile.fileDetails,
          copies: formData.copies,
          printType: formData.colorType,
          doubleSided: formData.doubleSided,
          specialPaper: formData.specialPaper,
          binding: formData.binding
        }]
      };

      // Create order using mutation
      createOrderMutation.mutate(orderData);

    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const handleStoreSelect = (storeId: string) => {
    setSelectedStore(storeId);
    localStorage.setItem('selectedStore', storeId);
  };

  return (
    <UserLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Store</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store">Store</Label>
                  <select
                    id="store"
                    value={selectedStore}
                    onChange={(e) => handleStoreSelect(e.target.value)}
                    className="w-full border rounded-md p-2"
                    required
                  >
                    <option value="">Select a Store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="document">Document</Label>
                <div className="space-y-2">
                  <Input
                    id="document"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    required
                  />
                  {isUploading && (
                    <p className="text-sm text-muted-foreground">
                      Uploading file...
                    </p>
                  )}
                  {uploadedFile && (
                    <p className="text-sm text-green-600">
                      ✓ {uploadedFile.fileDetails.name} uploaded successfully
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="copies">Number of Copies</Label>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  value={formData.copies}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    copies: parseInt(e.target.value) || 1
                  }))}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="colorType"
                  checked={formData.colorType === 'color'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    colorType: e.target.checked ? 'color' : 'blackAndWhite'
                  }))}
                />
                <Label htmlFor="colorType">Color Print</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="doubleSided"
                  checked={formData.doubleSided}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    doubleSided: e.target.checked
                  }))}
                />
                <Label htmlFor="doubleSided">Double-sided</Label>
              </div>

              <Button 
                type="submit" 
                disabled={createOrderMutation.isPending || isUploading || !uploadedFile}
                className="w-full"
              >
                {createOrderMutation.isPending ? 'Creating Order...' : 'Create Order'}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </UserLayout>
  );
};

export default NewOrder; 