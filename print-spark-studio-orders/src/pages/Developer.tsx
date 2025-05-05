import React from 'react';
import { useMaintenance } from '@/services/maintenanceService';
import { Button } from '@/components/ui/button';

const Developer = () => {
  const { isMaintenanceMode, setMaintenanceMode, resetMaintenanceMode } = useMaintenance();

  const handleToggle = () => {
    setMaintenanceMode(!isMaintenanceMode);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Developer Controls</h1>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleToggle}
            variant={isMaintenanceMode ? "destructive" : "default"}
          >
            {isMaintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode
          </Button>
          <Button 
            onClick={resetMaintenanceMode}
            variant="outline"
          >
            Reset Maintenance Mode
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Current Status: {isMaintenanceMode ? 'Maintenance Mode ON' : 'Maintenance Mode OFF'}
        </p>
      </div>
    </div>
  );
};

export default Developer; 