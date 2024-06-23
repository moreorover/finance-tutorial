import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import * as useNewHair from "@/features/hair/hooks/use-new-hair";
import { HairForm } from "./hair-form";
import { insertHairSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateHair } from "@/features/hair/api/use-create-hair";
import { convertNumberToPossitive } from "@/lib/utils";

const formSchema = insertHairSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewHairSheet = () => {
  const { isOpen, onClose, orderId } = useNewHair.useNewHair();
  const mutation = useCreateHair();

  const onSubmit = (values: FormValues) => {
    mutation.mutate(
      {
        ...values,
        orderId,
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Hair</SheetTitle>
          <SheetDescription>Create a new hair.</SheetDescription>
        </SheetHeader>
        <HairForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={{
            upc: "",
            length: "",
            weight: "",
            orderId: null,
            price: "",
            isPriceFixed: false,
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
