export interface StoreAdmin {
  id: string;
  name: string;
  email: string;
  storeId: string;
  storeName: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface Store {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  operatingHours: {
    open: string;
    close: string;
  };
  adminId?: string;
} 