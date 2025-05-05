import React from 'react';
import MessageCenter from "./components/messaging/MessageCenter";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, createBrowserRouter, RouterProvider } from "react-router-dom";
import { MaintenanceProvider, useMaintenance } from './services/maintenanceService';
import Maintenance from './pages/Maintenance';
import Developer from './pages/Developer';

// Auth Context Provider
import { AuthProvider } from "./contexts/AuthContext";

// User Pages
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/user/Dashboard";
import NewOrder from "./pages/user/NewOrder";
import OrderHistory from "./pages/user/OrderHistory";
import OrderDetails from "./pages/user/OrderDetails";
import UserProfile from "./pages/user/Profile";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import ManageOrders from "./pages/admin/ManageOrders";
import ManageUsers from "./pages/admin/ManageUsers";
import PricingSettings from "./pages/admin/PricingSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import NotFound from "./pages/NotFound";

// Protected Route Component
import ProtectedRoute from "./components/ProtectedRoute";

// Add Developer Pages imports
import DeveloperLogin from "./pages/developer/DeveloperLogin";
import DeveloperDashboard from "./pages/developer/Dashboard";
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/theme-provider';
import AppRoutes from '@/routes';

const queryClient = new QueryClient();

const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state } = useMaintenance();
  const location = useLocation();

  // Check if the current path is a developer route
  const isDeveloperRoute = location.pathname.startsWith('/developer');

  if (state.isMaintenanceMode && !isDeveloperRoute) {
    return <Maintenance />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <MaintenanceGuard><Homepage /></MaintenanceGuard>
  },
  {
    path: "*",
    element: (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <MessageCenter />
            <Sonner />
            <MaintenanceGuard>
              <AppRoutes />
            </MaintenanceGuard>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    ),
  },
]);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <MaintenanceProvider>
            <AuthProvider>
              <TooltipProvider>
                <MessageCenter />
                <Toaster />
                <Sonner />
                <AppRoutes />
              </TooltipProvider>
            </AuthProvider>
          </MaintenanceProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
