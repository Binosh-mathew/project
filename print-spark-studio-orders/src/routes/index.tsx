import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingState';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy load all your pages
const Home = lazy(() => import('@/pages/Home'));
const Orders = lazy(() => import('@/pages/Orders'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const UserDashboard = lazy(() => import('@/pages/user/Dashboard'));
const NewOrder = lazy(() => import('@/pages/user/NewOrder'));
const OrderHistory = lazy(() => import('@/pages/user/OrderHistory'));
const OrderDetails = lazy(() => import('@/pages/user/OrderDetails'));
const UserProfile = lazy(() => import('@/pages/user/Profile'));
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const ManageOrders = lazy(() => import('@/pages/admin/ManageOrders'));
const ManageUsers = lazy(() => import('@/pages/admin/ManageUsers'));
const PricingSettings = lazy(() => import('@/pages/admin/PricingSettings'));
const AdminProfile = lazy(() => import('@/pages/admin/AdminProfile'));
const NotFound = lazy(() => import('@/pages/NotFound'));

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/new-order" element={<NewOrder />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/manage-orders" element={<ManageOrders />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/admin/pricing-settings" element={<PricingSettings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
} 