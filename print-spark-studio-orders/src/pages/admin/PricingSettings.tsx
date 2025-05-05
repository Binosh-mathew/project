import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, CreditCard, FileText, Printer, Info, BookOpen, Layers } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { apiService } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PricingSettings = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch pricing settings
  const { data: prices = {
    paperTypes: {},
    bindingTypes: {},
    blackAndWhitePrinting: 0,
    colorPrinting: 0
  }, isLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: () => apiService.getPricingSettings().then(res => res.data),
  });

  // Update pricing settings mutation
  const updatePricingMutation = useMutation({
    mutationFn: (settings: typeof prices) => apiService.updatePricingSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      toast({
        title: "Pricing updated",
        description: "Your print pricing settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: "There was a problem updating the pricing settings.",
        variant: "destructive",
      });
    },
  });

  const handlePriceChange = (
    printType: 'blackAndWhitePrinting' | 'colorPrinting',
    value: string
  ) => {
    const numericValue = parseFloat(value) || 0;
    const updatedPrices = {
      ...prices,
      [printType]: numericValue,
    };
    updatePricingMutation.mutate(updatedPrices);
  };

  const handleBindingPriceChange = (
    bindingType: keyof typeof prices.bindingTypes,
    value: string
  ) => {
    const numericValue = parseFloat(value) || 0;
    const updatedPrices = {
      ...prices,
      bindingTypes: {
        ...prices.bindingTypes,
        [bindingType]: numericValue,
      },
    };
    updatePricingMutation.mutate(updatedPrices);
  };

  const handlePaperTypePriceChange = (
    paperType: keyof typeof prices.paperTypes,
    value: string
  ) => {
    const numericValue = parseFloat(value) || 0;
    const updatedPrices = {
      ...prices,
      paperTypes: {
        ...prices.paperTypes,
        [paperType]: numericValue,
      },
    };
    updatePricingMutation.mutate(updatedPrices);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pricing Settings</h1>
          <p className="text-gray-600 mt-1">Manage pricing for print services</p>
        </div>
        
        <Tabs defaultValue="standard" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="standard">Standard Pricing</TabsTrigger>
            <TabsTrigger value="binding">Binding</TabsTrigger>
            <TabsTrigger value="paper">Paper Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <FileText className="mr-2 h-5 w-5" />
                  Black & White Printing
                </CardTitle>
                <CardDescription>
                  Set pricing for black and white prints per page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bw-single">Single-sided (₹ per page)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <Input
                        id="bw-single"
                        type="number"
                        value={prices.blackAndWhitePrinting}
                        onChange={(e) => handlePriceChange('blackAndWhitePrinting', e.target.value)}
                        className="pl-8"
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Printer className="mr-2 h-5 w-5" />
                  Color Printing
                </CardTitle>
                <CardDescription>
                  Set pricing for color prints per page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="color-single">Single-sided (₹ per page)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                      <Input
                        id="color-single"
                        type="number"
                        value={prices.colorPrinting}
                        onChange={(e) => handlePriceChange('colorPrinting', e.target.value)}
                        className="pl-8"
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="binding" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Binding Options
                </CardTitle>
                <CardDescription>
                  Set pricing for different binding types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(prices.bindingTypes).map(([type, price]) => (
                    <div key={type} className="space-y-2">
                      <Label htmlFor={`${type}-binding`}>{type} (₹)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id={`${type}-binding`}
                          type="number"
                          value={price}
                          onChange={(e) => handleBindingPriceChange(type, e.target.value)}
                          className="pl-8"
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="paper" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Layers className="mr-2 h-5 w-5" />
                  Paper Types
                </CardTitle>
                <CardDescription>
                  Set additional cost per page for different paper types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(prices.paperTypes).map(([type, price]) => (
                    <div key={type} className="space-y-2">
                      <Label htmlFor={`${type}-paper`}>{type} (₹ per page)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                        <Input
                          id={`${type}-paper`}
                          type="number"
                          value={price}
                          onChange={(e) => handlePaperTypePriceChange(type, e.target.value)}
                          className="pl-8"
                          min="0"
                          step="0.5"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="rounded-full bg-primary-100 p-2 text-primary mr-3">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Online Payment Gateway</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    All payments are processed securely through our integrated Google Pay / UPI gateway.
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="rounded-md bg-yellow-50 p-4 text-sm flex">
                <Info className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                <p className="text-yellow-700">
                  Note: When you update pricing, it will affect all new orders. Existing orders will maintain their original pricing.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PricingSettings;
