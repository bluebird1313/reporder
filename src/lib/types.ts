// Legacy mock data type - can be removed once fully migrated to database
export type Store = {
  id: number;
  name: string;
  location: string;
  totalItems: number;
  lowStockItems: number;
  outOfStock: number;
  inventoryHealth: number;
};

// Database store types are defined in the service layer
// See /lib/services/dashboard.ts for DashboardStore interface 