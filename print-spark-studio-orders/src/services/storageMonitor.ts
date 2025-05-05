import { api } from './api';

// Mock storage data for demonstration
export interface StorageInfo {
  totalSpace: number;  // in GB
  usedSpace: number;   // in GB
  freeSpace: number;   // in GB
  usagePercentage: number;
  lastUpdated: Date;
}

class StorageMonitor {
  private static instance: StorageMonitor;
  private storageInfo: StorageInfo;
  private listeners: ((info: StorageInfo) => void)[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.storageInfo = {
      totalSpace: 0,
      usedSpace: 0,
      freeSpace: 0,
      usagePercentage: 0,
      lastUpdated: new Date()
    };
  }

  public static getInstance(): StorageMonitor {
    if (!StorageMonitor.instance) {
      StorageMonitor.instance = new StorageMonitor();
    }
    return StorageMonitor.instance;
  }

  public async getCurrentStorageInfo(): Promise<StorageInfo> {
    try {
      const response = await api.get('/storage/info');
      this.storageInfo = {
        ...response.data.data,
        lastUpdated: new Date()
      };
      return this.storageInfo;
    } catch (error) {
      console.error('Error fetching storage info:', error);
      return this.storageInfo;
    }
  }

  // Test method to simulate different storage conditions
  public simulateStorageLevel(usagePercentage: number) {
    const totalSpace = this.storageInfo.totalSpace;
    const usedSpace = (usagePercentage / 100) * totalSpace;
    const freeSpace = totalSpace - usedSpace;

    this.storageInfo = {
      totalSpace,
      usedSpace: Number(usedSpace.toFixed(2)),
      freeSpace: Number(freeSpace.toFixed(2)),
      usagePercentage: Number(usagePercentage.toFixed(1)),
      lastUpdated: new Date()
    };

    // Notify all listeners of the change
    this.listeners.forEach(listener => listener(this.storageInfo));
  }

  // Test methods for specific scenarios
  public simulateCriticalStorage() {
    this.simulateStorageLevel(95); // 95% used, 5% free
  }

  public simulateNormalStorage() {
    this.simulateStorageLevel(60); // 60% used, 40% free
  }

  public simulateWarningStorage() {
    this.simulateStorageLevel(85); // 85% used, 15% free
  }

  public startMonitoring(listener: (info: StorageInfo) => void) {
    this.listeners.push(listener);
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => this.updateStorageInfo(), 30000); // Update every 30 seconds
    }
  }

  public stopMonitoring(listener: (info: StorageInfo) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
    if (this.listeners.length === 0 && this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private async updateStorageInfo() {
    try {
      const response = await api.get('/storage/info');
      this.storageInfo = {
        ...response.data.data,
        lastUpdated: new Date()
      };
      this.listeners.forEach(listener => listener(this.storageInfo));
    } catch (error) {
      console.error('Error updating storage info:', error);
    }
  }

  public isStorageCritical(): boolean {
    return this.storageInfo.freeSpace / this.storageInfo.totalSpace < 0.1; // Less than 10% free
  }
}

export const storageMonitor = StorageMonitor.getInstance();
export type { StorageInfo }; 