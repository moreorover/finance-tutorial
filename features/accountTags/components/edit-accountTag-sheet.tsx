import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AccountTagForm } from "./accountTag-form";
import { insertAccountTagSchema } from "@/db/schema";
import { z } from "zod";
import { useOpenAccountTag } from "../hooks/use-open-accountTag";
import { useGetAccountTag } from "../api/use-get-accountTag";
import { Loader2 } from "lucide-react";
import { useEditAccountTag } from "../api/use-edit-accountTag";
import { useDeleteAccountTag } from "../api/use-delete-accountTag";
import { useConfirm } from "@/hooks/use-confirm";

const formSchema = insertAccountTagSchema.pick({
  title: true,
});

type FormValues = z.input<typeof formSchema>;

export const EditAccountTagSheet = () => {
  const { isOpen, onClose, id } = useOpenAccountTag();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction"
  );

  const accountTagQuery = useGetAccountTag(id);
  const editMutation = useEditAccountTag(id);
  const deleteMutation = useDeleteAccountTag(id);
  const isPending = editMutation.isPending || deleteMutation.isPending;
  const isLoading = accountTagQuery.isLoading;
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

  const defaultValues = accountTagQuery.data
    ? {
        title: accountTagQuery.data.title,
      }
    : {
        title: "",
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Account tag</SheetTitle>
            <SheetDescription>Edit an existing account tag.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <AccountTagForm
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
