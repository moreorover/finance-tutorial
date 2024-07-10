import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertAccountsSchema } from "@/db/schema";
import { useGetAccountTags } from "@/features/accountTags/api/use-get-accountTags";
import { useConfirm } from "@/hooks/use-confirm";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useDeleteAccount } from "../api/use-delete-account";
import { useEditAccount } from "../api/use-edit-account";
import { useGetAccount } from "../api/use-get-account";
import { useGetAccountTagsForAccountId } from "../api/use-get-account-tags";
import { useUpdateAccountTags } from "../api/use-update-account-tags";
import { useOpenAccount } from "../hooks/use-open-account";
import { AccountForm } from "./account-form";

const formSchema = insertAccountsSchema
  .pick({
    fullName: true,
    instagram: true,
    emailAddress: true,
    phoneNumber: true,
  })
  .extend({
    tags: z.array(z.object({ value: z.string(), label: z.string() })),
  });

type FormValues = z.input<typeof formSchema>;

export const EditAccountSheet = () => {
  const { isOpen, onClose, id } = useOpenAccount();

  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction",
  );

  const accountQuery = useGetAccount(id);
  const accountTagsQuery = useGetAccountTagsForAccountId(id);
  const allTagsQuery = useGetAccountTags();
  const editMutation = useEditAccount(id);
  const updateAccountTagsMutation = useUpdateAccountTags(id);
  const deleteMutation = useDeleteAccount(id);
  const isPending =
    editMutation.isPending ||
    updateAccountTagsMutation.isPending ||
    deleteMutation.isPending;
  const isLoading = accountQuery.isLoading || accountTagsQuery.isLoading;
  const onSubmit = (values: FormValues) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        const mappedTagIds = values.tags.map((tag) => tag.value);
        mappedTagIds.length > 0 &&
          updateAccountTagsMutation.mutate(
            { tagIds: mappedTagIds },
            {
              onSuccess: () => {
                onClose();
              },
            },
          );
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

  const defaultValues = accountQuery.data
    ? {
        fullName: accountQuery.data.fullName,
        instagram: accountQuery.data.instagram,
        emailAddress: accountQuery.data.emailAddress,
        phoneNumber: accountQuery.data.phoneNumber,
        tags:
          accountTagsQuery.data?.map(({ id, title }) => ({
            label: title,
            value: id,
          })) || [],
      }
    : {
        fullName: "",
        instagram: "",
        emailAddress: "",
        phoneNumber: "",
        tags: [],
      };

  return (
    <>
      <ConfirmDialog />
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="space-y-4">
          <SheetHeader>
            <SheetTitle>Edit Account</SheetTitle>
            <SheetDescription>Edit an existing account.</SheetDescription>
          </SheetHeader>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <AccountForm
              id={id}
              // accountTags={
              //   accountTagsQuery.data?.map(({ id, title }) => ({
              //     label: title,
              //     value: id,
              //   })) || []
              // }
              allTags={
                allTagsQuery.data?.map(({ id, title }) => ({
                  label: title,
                  value: id,
                })) || []
              }
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
