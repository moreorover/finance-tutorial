import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["$delete"]
>;

export const useDeleteOrder = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.orders[":id"]["$delete"]({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Order deleted");
      queryClient.invalidateQueries({ queryKey: ["order", { id }] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("Failed to delete order");
    },
  });
  return mutation;
};
