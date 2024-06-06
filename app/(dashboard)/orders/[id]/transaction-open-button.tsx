"use client";

import { Button } from "@/components/ui/button";
import { useDeleteTransaction } from "@/features/transactions/api/use-delete-transaction";
import { useOpenTransaction } from "@/features/transactions/hooks/use-open-transaction";
import { MoveUpRight } from "lucide-react";

type Props = {
  id: string;
};

export const TransactionOpenButton = ({ id }: Props) => {
  const deleteMutation = useDeleteTransaction(id);
  const { onOpen } = useOpenTransaction();

  return (
    <>
      <Button
        variant="outline"
        disabled={deleteMutation.isPending}
        onClick={() => onOpen(id)}
      >
        <MoveUpRight className="size-4 mr-2" /> Unassigned
      </Button>
    </>
  );
};
