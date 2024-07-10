"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetHair } from "@/features/hair/api/use-get-hair";
import { Paths } from "@/lib/constants";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function Hair({ id }: { id: string }) {
  const hair = useGetHair(id);

  const loading = hair.isLoading || hair.isRefetching;

  if (hair.isError) {
    redirect(Paths.Home);
  }

  if (loading) {
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

  if (hair.isSuccess) {
    return <div>Hair: {hair.data.id}</div>;
  }
}
