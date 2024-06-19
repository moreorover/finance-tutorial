import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { OrderForm } from "./order-form";
import { insertOrderSchema, orderType } from "@/db/schema";
import { z } from "zod";
import { useOpenOrder } from "../hooks/use-open-order";
import { useGetOrder } from "../api/use-get-order";
import { Loader2 } from "lucide-react";
import { useEditOrder } from "../api/use-edit-order";
import { useDeleteOrder } from "../api/use-delete-order";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

const formSchema = insertOrderSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;

export const EditOrderSheet = () => {
  const { isOpen, onClose, id } = useOpenOrder();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction",
  );

  const orderQuery = useGetOrder(id);
  const editMutation = useEditOrder(id);
  const deleteMutation = useDeleteOrder(id);
  const accountsQuery = useGetAccounts();
  const isPending = editMutation.isPending || deleteMutation.isPending;
  const isLoading = orderQuery.isLoading || accountsQuery.isLoading;

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

  const accountOptions = (accountsQuery.data ?? []).map((account) => ({
    label: account.fullName,
    value: account.id,
  }));

  const defaultValues = orderQuery.data
    ? {
        title: orderQuery.data.title,
        orderType: orderQuery.data.orderType,
        placedAt: orderQuery.data.placedAt
          ? new Date(orderQuery.data.placedAt)
          : new Date(),
        accountId: orderQuery.data.accountId,
      }
    : {
        title: "",
        orderType: orderType.enumValues[0],
        placedAt: new Date(),
        accountId: null,
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Order</SheetTitle>
            <SheetDescription>Edit an existing order.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <OrderForm
              id={id}
              accountOptions={accountOptions}
              onSubmit={onSubmit}
              disabled={isPending}
              defaultValues={defaultValues}
              onDelete={() => onDelete()}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
