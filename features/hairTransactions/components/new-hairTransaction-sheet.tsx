import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertHairTransactionSchema } from "@/db/schema";
import { useCreateHairTransaction } from "@/features/hairTransactions/api/use-create-hairTransaction";
import * as useNewHairTransaction from "@/features/hairTransactions/hooks/use-new-hairTransaction";
import { useGetHairsQueryType } from "@/lib/query-types";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { HairTransactionForm } from "./hairTransaction-form";

const formSchema = insertHairTransactionSchema.omit({
  id: true,
  orderId: true,
});

type FormValues = z.input<typeof formSchema>;

type Props = {
  hairInStock: useGetHairsQueryType;
};

export const NewHairTransactionSheet = ({ hairInStock }: Props) => {
  const { isOpen, onClose, orderId } =
    useNewHairTransaction.useNewHairTransaction();
  const mutation = useCreateHairTransaction();

  const isLoading = hairInStock.isLoading || hairInStock.isRefetching;

  const onSubmit = (values: FormValues) => {
    orderId &&
      mutation.mutate(
        {
          ...values,
          orderId,
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
  };

  if (isLoading || !hairInStock.data) {
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Hair Transaction</SheetTitle>
          <SheetDescription>Create a new hair transaction.</SheetDescription>
        </SheetHeader>
        <HairTransactionForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          hair={hairInStock.data}
          defaultValues={{
            weight: "",
            price: "",
            parentHairId: "",
            orderId: "",
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
