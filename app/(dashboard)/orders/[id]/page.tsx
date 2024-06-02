"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useGetOrder } from "@/features/orders/api/use-get-order";
import { OrderOpenButton } from "./order-open-button";
import { formatCurrency, formatDateStampString } from "@/lib/utils";
import { AccountColumn } from "./account-column";

const OrderPage = ({ params }: { params: { id: string } }) => {
  const orderQuery = useGetOrder(params.id);

  const isDisabled = orderQuery.isLoading;

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

  return (
    <div className="mx-auto -mt-24 w-full max-w-screen-2xl pb-10">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="line-clamp-1 text-xl">
            {orderQuery.data?.title}
          </CardTitle>
          <div className="flex items-center gap-x-2">
            <OrderOpenButton id={orderQuery.data?.id} />
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
                  {formatCurrency(
                    orderQuery.data?.total * -1,
                    orderQuery.data?.currency,
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Account</CardDescription>
                <CardTitle className="text-4xl">
                  <AccountColumn
                    orderId={orderQuery.data.id}
                    accountId={orderQuery.data?.accountId}
                    account={orderQuery.data?.account}
                  />
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderPage;
