import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { HairForm } from "./hair-form";
import { insertHairSchema } from "@/db/schema";
import { z } from "zod";
import { useOpenHair } from "../hooks/use-open-hair";
import { useGetHair } from "../api/use-get-hair";
import { Loader2 } from "lucide-react";
import { useEditHair } from "../api/use-edit-hair";
import { useDeleteHair } from "../api/use-delete-hair";
import { useConfirm } from "@/hooks/use-confirm";
import { convertNumberToPossitive } from "@/lib/utils";

const formSchema = insertHairSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;

export const EditHairSheet = () => {
  const { isOpen, onClose, id } = useOpenHair();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction",
  );

  const hairQuery = useGetHair(id);
  const editMutation = useEditHair(id);
  const deleteMutation = useDeleteHair(id);
  const isPending = editMutation.isPending || deleteMutation.isPending;
  const isLoading = hairQuery.isLoading || hairQuery.isRefetching;

  const onSubmit = (values: FormValues) => {
    editMutation.mutate(
      {
        ...values,
        price:
          values.isPriceFixed && values.price
            ? convertNumberToPossitive(values.price)
            : 0,
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
        upc: hairQuery.data.upc,
        colour: hairQuery.data.colour,
        length: hairQuery.data.length.toString(),
        weight: hairQuery.data.weight.toString(),
        orderId: hairQuery.data.orderId,
        sellerId: hairQuery.data.sellerId,
        price: hairQuery.data.price.toString(),
        isPriceFixed: hairQuery.data.isPriceFixed,
      }
    : {
        upc: "",
        length: "",
        weight: "",
        orderId: null,
        sellerId: null,
        price: "",
        isPriceFixed: false,
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Hair</SheetTitle>
            <SheetDescription>Edit an existing hair.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <HairForm
              id={id}
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
