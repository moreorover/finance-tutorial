import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import * as useNewAccountTag from "@/features/accountTags/hooks/use-new-accountTag";
import { AccountTagForm } from "./accountTag-form";
import { insertAccountTagSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateAccountTag } from "@/features/accountTags/api/use-create-accountTag";

const formSchema = insertAccountTagSchema.pick({
  title: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewAccountTagSheet = () => {
  const { isOpen, onClose } = useNewAccountTag.useNewAccountTag();
  const mutation = useCreateAccountTag();
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
          <SheetTitle>New Account Tag</SheetTitle>
          <SheetDescription>Create a new account tag.</SheetDescription>
        </SheetHeader>
        <AccountTagForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={{
            title: "",
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
