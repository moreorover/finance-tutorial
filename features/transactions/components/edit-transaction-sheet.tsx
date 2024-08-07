import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TransactionForm } from "./transaction-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useConfirm } from "@/hooks/use-confirm";
import { useOpenTransaction } from "../hooks/use-open-transaction";
import { insertTransactionSchema, transactionType } from "@/db/schema";
import { useEditTransaction } from "../api/use-edit-transaction";
import { useGetTransaction } from "../api/use-get-transaction";
import { useDeleteTransaction } from "../api/use-delete-transaction";
import { useGetAccountsQueryType } from "@/lib/query-types";

const formSchema = insertTransactionSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;

type Props = {
  accountsQuery: useGetAccountsQueryType;
};

export const EditTransactionSheet = ({accountsQuery}: Props) => {
  const { isOpen, onClose, id } = useOpenTransaction();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction",
  );

  const transactionQuery = useGetTransaction(id);
  const editMutation = useEditTransaction(id);
  const deleteMutation = useDeleteTransaction(id);
  const isPending = editMutation.isPending || deleteMutation.isPending;
  const isLoading =
    transactionQuery.isLoading ||
    accountsQuery.isLoading ||
    transactionQuery.isRefetching ||
    accountsQuery.isRefetching;

  const accountOptions = (accountsQuery.data ?? []).map((account) => ({
    label: account.fullName,
    value: account.id,
  }));

  const typeOptions = transactionType.enumValues.map((t) => ({
    value: t,
    label: t,
  }));

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const onDelete = async () => {
    const ok = await confirm();

    if (ok) {
      deleteMutation.mutate(undefined, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const defaultValues = transactionQuery.data
    ? {
        accountId: transactionQuery.data.accountId,
        orderId: transactionQuery.data.orderId,
        type: transactionQuery.data.type,
        amount: transactionQuery.data.amount.toString(),
        date: transactionQuery.data.date
          ? new Date(transactionQuery.data.date)
          : new Date(),
        notes: transactionQuery.data.notes,
      }
    : {
        accountId: "",
        orderId: null,
        type: transactionType.enumValues[0],
        amount: "",
        date: new Date(),
        notes: "",
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Transaction</SheetTitle>
            <SheetDescription>Edit an existing transaction.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TransactionForm
              id={id}
              onSubmit={onSubmit}
              disabled={isPending}
              defaultValues={defaultValues}
              onDelete={() => onDelete()}
              accountOptions={accountOptions}
              typeOptions={typeOptions}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
