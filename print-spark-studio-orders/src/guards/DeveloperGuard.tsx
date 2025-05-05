import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DeveloperGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'developer') {
    return <Navigate to="/developer/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default DeveloperGuard;