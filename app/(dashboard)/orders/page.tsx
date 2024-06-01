"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewOrder } from "@/features/orders/hooks/use-new-order";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useGetOrders } from "@/features/orders/api/use-get-orders";

const OrdersPage = () => {
  const newOrder = useNewOrder();
  const ordersQuery = useGetOrders();

  const orders = ordersQuery.data ? ordersQuery.data : [];

  const isDisabled = ordersQuery.isLoading;

  if (ordersQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader className="h-8 w-48"></CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Orders Page</CardTitle>
          <div className="flex items-center gap-x-2">
            <Button onClick={newOrder.onOpen} size="sm">
              <Plus className="size-4 mr-2" />
              Add new
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            filterLabel="Title"
            filterKey="title"
            columns={columns}
            data={orders}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
