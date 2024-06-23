"use client";

import { Button } from "@/components/ui/button";
import { useDeleteOrder } from "@/features/orders/api/use-delete-order";
import { useOpenOrder } from "@/features/orders/hooks/use-open-order";
import { MoveUpRight } from "lucide-react";

type Props = {
  id: string;
};

export const OrderOpenButton = ({ id }: Props) => {
  const deleteMutation = useDeleteOrder(id);
  const { onOpen } = useOpenOrder();

  return (
    <>
      <Button
        variant="outline"
        disabled={deleteMutation.isPending}
        onClick={() => onOpen(id)}
      >
        <MoveUpRight className="mr-2 size-4" /> Unassigned
      </Button>
    </>
  );
};
