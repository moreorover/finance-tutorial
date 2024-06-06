"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { insertTransactionSchema } from "@/db/schema";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { MonzoUploadButton } from "./monzo-upload-button";
import { z } from "zod";

const TransactionsPage = () => {
  const { onOpen } = useNewTransaction();
  const transactionsQuery = useGetTransactions();
  const createTransactions = useBulkCreateTransactions();

  const transactions = transactionsQuery.data ? transactionsQuery.data : [];

  const isDisabled = transactionsQuery.isLoading;

  const onUpload = (results: z.infer<typeof insertTransactionSchema>[]) => {
    createTransactions.mutate(results);
  };

  if (transactionsQuery.isLoading) {
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
            Transactions Page
          </CardTitle>
          <div className="flex items-center gap-x-2">
            <Button onClick={onOpen} size="sm">
              <Plus className="mr-2 size-4" />
              Add new
            </Button>
            <MonzoUploadButton onUpload={onUpload} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            filterLabel="Type"
            filterKey="type"
            columns={columns}
            data={transactions}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
