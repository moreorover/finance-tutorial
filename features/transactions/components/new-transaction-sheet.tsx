import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertTransactionSchema, transactionType } from "@/db/schema";
import { useCreateTransaction } from "@/features/transactions/api/use-create-transaction";
import * as useNewTransactions from "@/features/transactions/hooks/use-new-transaction";
import { useGetAccountsQueryType } from "@/lib/query-types";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { TransactionForm } from "./transaction-form";

const formSchema = insertTransactionSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;

type Props = {
  accountsQuery: useGetAccountsQueryType;
};

export const NewTransactionSheet = ({ accountsQuery }: Props) => {
  const { isOpen, orderId, onClose, accountId } =
    useNewTransactions.useNewTransaction();

  const isLoading = accountsQuery.isLoading;

  const accountOptions = (accountsQuery.data ?? []).map((account) => ({
    label: account.fullName,
    value: account.id,
  }));

  const typeOptions = transactionType.enumValues.map((t) => ({
    value: t,
    label: t,
  }));

  const mutation = useCreateTransaction();

  const isPending = mutation.isPending;

  const onSubmit = (values: FormValues) => {
    // console.table(values);
    mutation.mutate(
      { ...values, orderId },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>Create a new transaction.</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TransactionForm
            onSubmit={onSubmit}
            disabled={isPending}
            defaultValues={{
              accountId: accountId || "",
              orderId: orderId || "",
              type: transactionType.enumValues[0],
              amount: "",
              date: new Date(),
              notes: "",
            }}
            accountOptions={accountOptions}
            typeOptions={typeOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
