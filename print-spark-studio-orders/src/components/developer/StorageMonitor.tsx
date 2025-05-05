import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HardDrive, AlertTriangle, AlertOctagon } from 'lucide-react';
import { storageMonitor, type StorageInfo } from '@/services/storageMonitor';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const StorageMonitor = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    totalSpace: 0,
    usedSpace: 0,
    freeSpace: 0,
    usagePercentage: 0,
    lastUpdated: new Date()
  });
  const [showAlert, setShowAlert] = useState(false);
  const [showCriticalDialog, setShowCriticalDialog] = useState(false);

  useEffect(() => {
    const initializeStorageInfo = async () => {
      const info = await storageMonitor.getCurrentStorageInfo();
      setStorageInfo(info);
    };

    initializeStorageInfo();

    const handleStorageUpdate = (info: StorageInfo) => {
      setStorageInfo(info);
      const isCritical = info.freeSpace / info.totalSpace < 0.1;
      setShowAlert(isCritical);
      if (isCritical) {
        setShowCriticalDialog(true);
      }
    };

    storageMonitor.startMonitoring(handleStorageUpdate);

    return () => {
      storageMonitor.stopMonitoring(handleStorageUpdate);
    };
  }, []);

  const formatStorage = (gb: number) => {
    if (gb >= 1000) {
      return `${(gb / 1000).toFixed(1)} TB`;
    }
    return `${gb.toFixed(1)} GB`;
  };

  const getProgressColor = () => {
    if (storageInfo.usagePercentage >= 90) return 'bg-red-500';
    if (storageInfo.usagePercentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleCriticalAcknowledge = () => {
    setShowCriticalDialog(false);
  };

  return (
    <div className="space-y-4">
      {showAlert && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low Storage Warning</AlertTitle>
          <AlertDescription>
            Server storage is running low ({formatStorage(storageInfo.freeSpace)} remaining). 
            Please free up some space to ensure smooth operation.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Used: {formatStorage(storageInfo.usedSpace)}</span>
              <span>Total: {formatStorage(storageInfo.totalSpace)}</span>
            </div>
            
            <Progress 
              value={storageInfo.usagePercentage} 
              className={cn("h-2", getProgressColor())}
            />

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                {formatStorage(storageInfo.freeSpace)} free
              </span>
              <span className={`font-medium ${getProgressColor()}`}>
                {storageInfo.usagePercentage}% used
              </span>
            </div>

            <div className="text-xs text-muted-foreground">
              Last updated: {storageInfo.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Storage Dialog */}
      <Dialog open={showCriticalDialog} onOpenChange={setShowCriticalDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertOctagon className="h-5 w-5" />
              Critical Storage Alert
            </DialogTitle>
            <DialogDescription>
              Server storage has reached a critical level and requires immediate attention.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-red-600 font-semibold">
              Server storage has reached a critical level!
            </div>
            <div className="space-y-2">
              <div>Current Status:</div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Used Space: {formatStorage(storageInfo.usedSpace)}</li>
                <li>Free Space: {formatStorage(storageInfo.freeSpace)}</li>
                <li>Usage: {storageInfo.usagePercentage}%</li>
              </ul>
            </div>
            <div>
              Immediate action is required to prevent system instability. 
              Please free up storage space or expand storage capacity.
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleCriticalAcknowledge}>
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StorageMonitor; 