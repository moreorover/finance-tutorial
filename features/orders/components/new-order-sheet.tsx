import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertOrderSchema } from "@/db/schema";
import { useCreateOrder } from "@/features/orders/api/use-create-order";
import * as useNewOrder from "@/features/orders/hooks/use-new-order";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { OrderForm } from "./order-form";
import { useGetAccountsQueryType } from "@/lib/query-types";

const formSchema = insertOrderSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;

type Props = {
  accountsQuery: useGetAccountsQueryType;
};

export const NewOrderSheet = ({ accountsQuery }: Props) => {
  const { isOpen, onClose } = useNewOrder.useNewOrder();
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
