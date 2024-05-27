import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import * as useNewAccount from "@/features/accounts/hooks/use-new-account";
import { AccountForm } from "./account-form";
import { insertAccountsSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateAccount } from "@/features/accounts/api/use-create-account";
import { useGetAccountTags } from "@/features/accountTags/api/use-get-accountTags";

const formSchema = insertAccountsSchema.pick({
  fullName: true,
  instagram: true,
  emailAddress: true,
  phoneNumber: true,
});

type FormValues = z.input<typeof formSchema>;

export const NewAccountSheet = () => {
  const { isOpen, onClose } = useNewAccount.useNewAccounts();
  const mutation = useCreateAccount();
  const allTagsQuery = useGetAccountTags();
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
          <SheetTitle>New Account</SheetTitle>
          <SheetDescription>Create a new account.</SheetDescription>
        </SheetHeader>
        <AccountForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={{
            fullName: "",
            instagram: "",
            emailAddress: "",
            phoneNumber: "",
            tags: [],
          }}
          allTags={
            allTagsQuery.data?.map(({ id, title }) => ({
              label: title,
              value: id,
            })) || []
          }
        />
      </SheetContent>
    </Sheet>
  );
};
