import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import * as useNewOrder from "@/features/orders/hooks/use-new-order";
import { OrderForm } from "./order-form";
import { insertOrderSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateOrder } from "@/features/orders/api/use-create-order";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { Loader2 } from "lucide-react";

const formSchema = insertOrderSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewOrderSheet = () => {
  const { isOpen, onClose } = useNewOrder.useNewOrder();
  const accountsQuery = useGetAccounts();
  const mutation = useCreateOrder();
  const isLoading = accountsQuery.isLoading;

  const accountOptions = (accountsQuery.data ?? []).map((account) => ({
    label: account.fullName,
    value: account.id,
  }));

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Order</SheetTitle>
          <SheetDescription>Create a new order.</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <OrderForm
            accountOptions={accountOptions}
            onSubmit={onSubmit}
            disabled={mutation.isPending}
            defaultValues={{
              orderType: "Sale",
              placedAt: new Date(),
              accountId: null,
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
