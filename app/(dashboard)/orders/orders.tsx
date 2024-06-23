"use client";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetOrders } from "@/features/orders/api/use-get-orders";
import { useNewOrder } from "@/features/orders/hooks/use-new-order";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";

const Orders = () => {
  const newOrder = useNewOrder();
  const ordersQuery = useGetOrders();

  const orders = ordersQuery.data ? ordersQuery.data : [];

  const isDisabled = ordersQuery.isLoading;

  if (ordersQuery.isLoading) {
    return (
      <div className="mx-auto -mt-24 w-full max-w-screen-2xl pb-10">
        <Card className="border-none drop-shadow-sm">
          <CardHeader className="h-8 w-48"></CardHeader>
          <CardContent>
            <div className="flex h-[500px] w-full items-center justify-center">
              <Loader2 className="size-6 animate-spin text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto -mt-24 w-full max-w-screen-2xl pb-10">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="line-clamp-1 text-xl">Orders Page</CardTitle>
          <div className="flex items-center gap-x-2">
            <Button onClick={newOrder.onOpen} size="sm">
              <Plus className="mr-2 size-4" />
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

export default Orders;
