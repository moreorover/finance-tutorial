import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { HairTransactionForm } from "./hairTransaction-form";
import { insertHairTransactionSchema } from "@/db/schema";
import { z } from "zod";
import { useOpenHairTransaction } from "../hooks/use-open-hairTransaction";
import { useGetHairTransaction } from "../api/use-get-hairTransaction";
import { Loader2 } from "lucide-react";
import { useEditHairTransaction } from "../api/use-edit-hairTransaction";
import { useDeleteHair } from "../api/use-delete-hair";
import { useConfirm } from "@/hooks/use-confirm";
import { useGetHairs } from "@/features/hair/api/use-get-hairs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const formSchema = insertHairTransactionSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;

export const EditHairTransactionSheet = () => {
  const { isOpen, onClose, id } = useOpenHairTransaction();
  const hairsQuery = useGetHairs();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction",
  );

  const hairQuery = useGetHairTransaction(id);
  const editMutation = useEditHairTransaction(id);
  const deleteMutation = useDeleteHair(id);
  const isPending = editMutation.isPending || deleteMutation.isPending;
  const isLoading = hairQuery.isLoading || hairQuery.isRefetching;

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(
      {
        ...values,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
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

  const defaultValues = hairQuery.data
    ? {
        weight: hairQuery.data.weight.toString(),
        orderId: hairQuery.data.orderId,
        price: hairQuery.data.price.toString(),
        parentHairId: hairQuery.data.parentHairId,
      }
    : {
        weight: "",
        orderId: "",
        price: "",
        parentHairId: "",
      };

  if (!hairsQuery.data) {
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
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Hair Transaction</SheetTitle>
            <SheetDescription>
              Edit an existing hair transaction.
            </SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <HairTransactionForm
              id={id}
              onSubmit={onSubmit}
              disabled={isPending}
              defaultValues={defaultValues}
              onDelete={() => onDelete()}
              hair={hairsQuery.data}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
