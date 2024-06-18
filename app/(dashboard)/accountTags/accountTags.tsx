"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewAccountTag } from "@/features/accountTags/hooks/use-new-accountTag";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useGetAccountTags } from "@/features/accountTags/api/use-get-accountTags";
import { useBulkDeleteAccountTags } from "@/features/accountTags/api/use-bulk-delete";

const AccountTags = () => {
  const newAccountTag = useNewAccountTag();
  const deleteAccountTags = useBulkDeleteAccountTags();
  const accountTagsQuery = useGetAccountTags();
  const accountTags = accountTagsQuery.data || [];

  const isDisabled = accountTagsQuery.isLoading || deleteAccountTags.isPending;

  if (accountTagsQuery.isLoading) {
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
    <div className="mx-auto -mt-24 w-full max-w-screen-2xl pb-10">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="line-clamp-1 text-xl">
            Account TAGs Page
          </CardTitle>
          <Button onClick={newAccountTag.onOpen} size="sm">
            <Plus className="mr-2 size-4" />
            Add new
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            filterLabel="Title"
            filterKey="title"
            columns={columns}
            data={accountTags}
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteAccountTags.mutate({ ids });
            }}
            disabled={isDisabled}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountTags;
