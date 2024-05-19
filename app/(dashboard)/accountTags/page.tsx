"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewAccountTag } from "@/features/accountTags/hooks/use-new-accountTag";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useGetAccountTags } from "@/features/accountTags/api/use-get-accountTags";
import { useBulkDeleteAccountTags } from "@/features/accountTags/api/use-bulk-delete";

const AccountTagsPage = () => {
  const newAccountTag = useNewAccountTag();
  const deleteAccountTags = useBulkDeleteAccountTags();
  const accountTagsQuery = useGetAccountTags();
  const accountTags = accountTagsQuery.data || [];

  const isDisabled = accountTagsQuery.isLoading || deleteAccountTags.isPending;

  if (accountTagsQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader className="h-8 w-48"></CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Account TAGs Page
          </CardTitle>
          <Button onClick={newAccountTag.onOpen} size="sm">
            <Plus className="size-4 mr-2" />
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

export default AccountTagsPage;
