"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { useGetOrder } from "@/features/orders/api/use-get-order";
import { OrderOpenButton } from "./order-open-button";
import {
  convertNumberToNegative,
  formatCurrency,
  formatDateStampString,
} from "@/lib/utils";
import { AccountColumn } from "./account-column";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { transactionColumns } from "./transaction-columns";
import { useNewHair } from "@/features/hair/hooks/use-new-hair";
import { hairColumns } from "./hair-columns";
import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";

export default function OrderPage({ params }: { params: { id: string } }) {
  const orderQuery = useGetOrder(params.id);
  const newTransaction = useNewTransaction();
  const newHair = useNewHair();

  if (orderQuery.failureCount == 2) redirect(Paths.Orders);

  const isDisabled = orderQuery.isLoading;

  const openNewTransaction = () => {
    newTransaction.setOrderId(params.id);
    orderQuery.data?.accountId &&
      newTransaction.setAccountId(orderQuery.data?.accountId);
    newTransaction.onOpen();
  };

  const openNewHair = () => {
    newHair.setOrderId(params.id);
    orderQuery.data?.accountId &&
      newHair.setSellerId(orderQuery.data?.accountId);
    newHair.onOpen();
  };

  if (isDisabled) {
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

  if (!orderQuery.data) {
    redirect(Paths.Orders);
  }

  return (
    <div className="mx-auto -mt-24 w-full max-w-screen-2xl pb-10">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="line-clamp-1 text-xl">
            {orderQuery.data.title} - {orderQuery.data.orderType}
          </CardTitle>
          <div className="flex items-center gap-x-2">
            <OrderOpenButton id={orderQuery.data.id} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Placed At</CardDescription>
                <CardTitle className="text-4xl">
                  {formatDateStampString(
                    orderQuery.data?.placedAt,
                    "d MMMM yyyy",
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total</CardDescription>
                <CardTitle className="text-4xl">
                  {formatCurrency(orderQuery.data?.total)}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Account</CardDescription>
                <CardTitle className="text-4xl">
                  {/* {JSON.stringify(orderQuery.data, null, 2)} */}
                  <AccountColumn
                    orderId={orderQuery.data.id}
                    accountId={orderQuery.data?.accountId}
                    account={orderQuery.data?.account?.fullName || ""}
                  />
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
          <div className="mx-auto mt-4 w-full max-w-screen-2xl pb-10">
            <Card className="border-none drop-shadow-sm">
              <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="line-clamp-1 text-xl">
                  Transactions
                </CardTitle>
                <div className="flex items-center gap-x-2">
                  <Button
                    onClick={openNewTransaction}
                    size="sm"
                    disabled={!orderQuery?.data?.accountId}
                  >
                    <Plus className="mr-2 size-4" />
                    Add new
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orderQuery.data?.transactions && (
                  <DataTable
                    filterLabel="Type"
                    filterKey="type"
                    columns={transactionColumns}
                    data={orderQuery.data.transactions}
                    disabled={isDisabled}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          <div className="mx-auto mt-4 w-full max-w-screen-2xl pb-10">
            <Card className="border-none drop-shadow-sm">
              <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="line-clamp-1 text-xl">Hair</CardTitle>
                <div className="flex items-center gap-x-2">
                  <Button
                    onClick={openNewHair}
                    size="sm"
                    disabled={!orderQuery?.data?.accountId}
                  >
                    <Plus className="mr-2 size-4" />
                    Add new
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {orderQuery.data?.hair && orderQuery.data?.hair.length > 0 && (
                  <DataTable
                    filterLabel="UPC"
                    filterKey="upc"
                    columns={hairColumns}
                    data={orderQuery.data?.hair}
                    disabled={isDisabled}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      {/* {JSON.stringify(orderQuery.data?.hair, null, 2)} */}
    </div>
  );
}
