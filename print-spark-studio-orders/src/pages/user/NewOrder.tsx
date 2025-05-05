import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import UserLayout from '@/components/layouts/UserLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/services/api';
import type { Order, OrderFile } from '@/services/api';
import type { FileDetails } from '@/types/order';

interface OrderFormData {
  documentName: string;
  files: FileDetails[];
  description: string;
}

const NewOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  const form = useForm<OrderFormData>({
    defaultValues: {
      documentName: '',
      files: [],
      description: '',
    },
  });

  const handleFileSelected = (fileDetail: FileDetails) => {
    const existingIndex = files.findIndex(f => f.file.name === fileDetail.file.name);
    const updatedFiles = existingIndex >= 0 
      ? files.map((f, index) => index === existingIndex ? fileDetail : f)
      : [...files, fileDetail];
    
    setFiles(updatedFiles);
    form.setValue('files', updatedFiles);
    form.setValue('documentName', `${updatedFiles.length} document${updatedFiles.length > 1 ? 's' : ''}`);
  };

  const handleFileRemoved = (file: File) => {
    const updatedFiles = files.filter(f => f.file.name !== file.name);
    setFiles(updatedFiles);
    form.setValue('files', updatedFiles);
    form.setValue('documentName', `${updatedFiles.length} document${updatedFiles.length > 1 ? 's' : ''}`);
  };

  const calculateTotalPrice = (fileDetails: FileDetails[]) => {
    return fileDetails.reduce((total, file) => total + (file.copies * 10), 0);
  };

  React.useEffect(() => {
    const newTotalPrice = calculateTotalPrice(files);
    setTotalPrice(newTotalPrice);
  }, [files]);

  const onSubmit = async (data: OrderFormData) => {
    if (files.length === 0) {
      toast({
        title: "Missing documents",
        description: "Please upload at least one document to print",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const hasColorFile = files.some(file => file.printType === 'color');
      const colorType: 'color' | 'blackAndWhite' = hasColorFile ? 'color' : 'blackAndWhite';
      const orderFiles: OrderFile[] = files.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type,
        copies: f.copies,
        printType: f.printType,
        doubleSided: f.doubleSided ?? false,
        specialPaper: f.specialPaper,
        binding: f.binding,
      }));
      const newOrder: Partial<Order> = {
        userId: user?.id || '',
        userName: user?.name || '',
        storeId: localStorage.getItem('selectedStore') || '',
        documentName: data.documentName,
        files: orderFiles,
        additionalInstructions: data.description,
        status: 'pending',
        totalPrice,
        copies: orderFiles.reduce((total, file) => total + file.copies, 0),
        colorType,
        doubleSided: orderFiles.some(file => file.doubleSided),
      };
      const response = await apiService.createOrder(newOrder);
      toast({
        title: "Order submitted successfully",
        description: "Your print order has been placed and is being processed",
      });
      navigate(`/user/orders/${response.data.data.id}`);
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Error submitting order",
        description: "An error occurred while submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Print Order</h1>
          <p className="text-gray-600 mt-2">Upload your documents and set printing preferences for each file</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="files"
                      render={() => (
                        <FormItem className="space-y-2">
                          <FormLabel>Upload Documents</FormLabel>
                          <FormControl>
                            <FileUploader 
                              onFileSelected={handleFileSelected}
                              onFileRemoved={handleFileRemoved}
                              files={files}
                            />
                          </FormControl>
                          <FormDescription>
                            Upload your documents and set specific preferences for each file
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel>Additional Instructions</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              placeholder="Add any general instructions for your order..."
                            />
                          </FormControl>
                          <FormDescription>
                            Add any additional instructions that apply to the entire order
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-500"
                        disabled={isSubmitting || files.length === 0}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Order...
                          </>
                        ) : (
                          'Submit Order'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/user/dashboard')}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <p className="text-sm text-gray-500 mb-1">Documents</p>
                    <p className="font-medium">
                      {files.length} document{files.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  {files.map((file, index) => (
                    <div key={index} className="border-b border-gray-200 pb-4">
                      <p className="font-medium truncate mb-2">{file.file.name}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Copies</span>
                          <span>{file.copies}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Print Type</span>
                          <span>{file.printType === 'color' ? 'Color' : 'Black & White'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Double-sided</span>
                          <span>{file.doubleSided ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Paper Type</span>
                          <span>{file.specialPaper === 'none' ? 'Normal' : file.specialPaper}</span>
                        </div>
                        {file.binding.needed && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Binding</span>
                            <span>{file.binding.type.replace('Binding', '')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Price</span>
                      <span className="text-xl font-bold">₹{totalPrice}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default NewOrder;

