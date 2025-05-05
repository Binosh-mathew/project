import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from '@/services/api';

interface AnalyticsData {
  dailyOrders: number[];
  revenue: number[];
  ordersByType: {
    color: number;
    blackAndWhite: number;
  };
  ordersByStatus: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  averageProcessingTime: number;
}

const DashboardAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState('week'); // week, month, year
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData(dateRange);
  }, [dateRange]);

  const fetchAnalyticsData = async (range: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/analytics?range=${range}`);
      setAnalyticsData(response.data.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for charts
  const prepareOrderData = () => {
    if (!analyticsData) return [];
    return analyticsData.dailyOrders.map((orders, index) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
      orders,
      revenue: analyticsData.revenue[index]
    }));
  };

  const prepareOrderTypeData = () => {
    if (!analyticsData) return [];
    return [
      { type: 'Color', value: analyticsData.ordersByType.color },
      { type: 'Black & White', value: analyticsData.ordersByType.blackAndWhite }
    ];
  };

  const prepareOrderStatusData = () => {
    if (!analyticsData) return [];
    return Object.entries(analyticsData.ordersByStatus).map(([status, value]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      value
    }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Date Range Selector */}
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.dailyOrders.reduce((a, b) => a + b, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{analyticsData?.revenue.reduce((a, b) => a + b, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Avg. Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.averageProcessingTime} mins
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData ? 
                ((analyticsData.ordersByStatus.completed / 
                  Object.values(analyticsData.ordersByStatus)
                    .reduce((a, b) => a + b, 0)) * 100).toFixed(1) 
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders and Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Orders & Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              width={500}
              height={300}
              data={prepareOrderData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                stroke="#8884d8"
                name="Orders"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                name="Revenue (₹)"
              />
            </LineChart>
          </CardContent>
        </Card>

        {/* Order Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Types Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              width={500}
              height={300}
              data={prepareOrderTypeData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Number of Orders" />
            </BarChart>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              width={500}
              height={300}
              data={prepareOrderStatusData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" name="Number of Orders" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardAnalytics;