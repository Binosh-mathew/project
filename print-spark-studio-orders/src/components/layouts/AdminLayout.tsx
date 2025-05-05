import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { MessageCircle } from 'lucide-react';
import MessageCenter from '@/components/messaging/MessageCenter';
import ProfileDropdown from '@/components/ui/ProfileDropdown';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [showMessageCenter, setShowMessageCenter] = React.useState(false); // Explicitly initialized to false

  const handleLogout = () => {
    logout();
    setShowMessageCenter(false);
    navigate('/admin/login');
  };

  const navItems = [
    { id: 'dashboard', path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'orders', path: '/admin/orders', label: 'Manage Orders', icon: <FileText size={18} /> },
    { id: 'pricing', path: '/admin/pricing', label: 'Pricing', icon: <Settings size={18} /> },
    { id: 'messages', label: 'Messages', icon: <MessageCircle size={18} />, onClick: () => setShowMessageCenter(true) }
];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/admin" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-primary">PrintSpark <span className="text-sm font-normal text-gray-500">Admin</span></span>
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="lg:hidden p-2 text-gray-600" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            {navItems.map((item) => (
              item.path ? (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center space-x-1 py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-150 ${
                  location.pathname === item.path
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-primary hover:border-primary-200'
                }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="flex items-center space-x-1 py-2 px-1 border-b-2 text-sm font-medium transition-colors duration-150 border-transparent text-gray-600 hover:text-primary hover:border-primary-200"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              )
            ))}
            <div className="ml-4 flex items-center space-x-4">
              <ProfileDropdown />
            </div>
          </nav>
        </div>
      </header>
      
      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-gray-200">
              <span className="font-bold text-xl text-primary">PrintSpark <span className="text-sm font-normal text-gray-500">Admin</span></span>
            </div>
            <nav className="px-2 py-3">
              {navItems.map((item) => (
                item.path ? (
                <Link
                    key={item.id}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-colors duration-150 ${
                    location.pathname === item.path
                      ? 'bg-primary-100 text-primary'
                      : 'text-gray-600 hover:bg-primary-100 hover:text-primary'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick?.();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-3 w-full text-left rounded-md text-gray-600 hover:bg-primary-100 hover:text-primary"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                )
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-3 w-full text-left rounded-md text-gray-600 hover:bg-primary-100 hover:text-primary"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© 2025 PrintSpark Studio Admin. All rights reserved.</p>
        </div>
      </footer>
      
      {showMessageCenter && <MessageCenter onClose={() => { setShowMessageCenter(false); }} isAdminView={true} />}
    </div>
  );
};

export default AdminLayout;