import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import * as useNewTransactions from "@/features/transactions/hooks/use-new-transaction";
import { TransactionForm } from "./transaction-form";
import { insertTransactionSchema, transactionType } from "@/db/schema";
import { z } from "zod";
import { useCreateTransaction } from "@/features/transactions/api/use-create-transaction";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { Loader2 } from "lucide-react";

const formSchema = insertTransactionSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;

export const NewTransactionSheet = () => {
  const { state, onClose } = useNewTransactions.useNewTransaction();

  const accountsQuery = useGetAccounts();
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
      { ...values, id: "", orderId: state.orderId },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };
  return (
    <Sheet open={state.isOpen} onOpenChange={onClose}>
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
              accountId: "",
              type: null,
              amount: "",
              date: new Date(),
              notes: "",
              currency: "",
            }}
            accountOptions={accountOptions}
            typeOptions={typeOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
