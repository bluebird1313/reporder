"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchStoreById, DashboardStore } from '@/lib/services/dashboard';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// This is how Next.js gets URL parameters for a page
export default function StoreDetailsPage({ params }: Props) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [store, setStore] = useState<DashboardStore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setStoreId(resolvedParams.storeId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!storeId) return;

    const loadStore = async () => {
      try {
        setLoading(true);
        const storeData = await fetchStoreById(storeId);
        setStore(storeData);
      } catch (error) {
        console.error('Error loading store:', error);
        toast.error('Failed to load store details');
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [storeId]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Store Not Found</h1>
        <p>Sorry, we couldn&apos;t find a store with that ID.</p>
      </div>
    );
  }

  // Placeholder data for purchase history
  const purchaseHistory = [
    { orderId: '#12345', date: '2024-05-20', total: 5432.10, status: 'Completed' },
    { orderId: '#12344', date: '2024-05-18', total: 312.50, status: 'Completed' },
    { orderId: '#12342', date: '2024-05-15', total: 1890.00, status: 'Processing' },
    { orderId: '#12341', date: '2024-05-11', total: 89.99, status: 'Completed' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Store Details</h1>
      
      {/* Store Information Card */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">{store.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <p><strong>Location:</strong> {store.location}</p>
          <p><strong>Total Items:</strong> {store.totalItems.toLocaleString()}</p>
          <p><strong>Low Stock Items:</strong> {store.lowStockItems}</p>
          <p><strong>Out of Stock Items:</strong> {store.outOfStock}</p>
          <div>
            <strong>Inventory Health:</strong> {store.inventoryHealth}%
          </div>
        </CardContent>
      </Card>

      {/* Purchase History Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseHistory.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell className="text-right">${order.total.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <span 
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 