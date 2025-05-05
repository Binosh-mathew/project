import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { maintenanceApi } from './api';
import { useLocation } from 'react-router-dom';

interface MaintenanceState {
  isMaintenanceMode: boolean;
  currentPath: string;
  isDeveloperRoute: boolean;
  shouldRedirect: boolean;
}

interface MaintenanceContextType {
  state: MaintenanceState;
  setMaintenanceMode: (isMaintenance: boolean) => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<MaintenanceState>({
    isMaintenanceMode: false,
    currentPath: '/',
    isDeveloperRoute: false,
    shouldRedirect: false
  });

  const location = useLocation();

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await maintenanceApi.getStatus();
        setState(prev => ({
          ...prev,
          isMaintenanceMode: response.data.data.isMaintenanceMode,
          currentPath: location.pathname,
          isDeveloperRoute: location.pathname.startsWith('/developer'),
          shouldRedirect: response.data.data.isMaintenanceMode && !location.pathname.startsWith('/developer')
        }));
      } catch (error) {
        console.error('Error fetching maintenance status:', error);
        // Default to non-maintenance mode if the request fails
        setState(prev => ({
          ...prev,
          isMaintenanceMode: false,
          currentPath: location.pathname,
          isDeveloperRoute: location.pathname.startsWith('/developer'),
          shouldRedirect: false
        }));
      }
    };

    fetchMaintenanceStatus();
  }, [location.pathname]);

  const setMaintenanceMode = (isMaintenance: boolean) => {
    setState(prev => ({
      ...prev,
      isMaintenanceMode: isMaintenance,
      shouldRedirect: isMaintenance && !prev.isDeveloperRoute
    }));
  };

  return (
    <MaintenanceContext.Provider value={{ state, setMaintenanceMode }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}; 