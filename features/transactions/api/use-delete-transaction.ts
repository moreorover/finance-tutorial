import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[":id"]["$delete"]
>;

type ResponseType200 = InferResponseType<
  (typeof client.api.transactions)[":id"]["$delete"],
  200
>;

export const useDeleteTransaction = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.transactions[":id"]["$delete"]({
        param: { id },
      });

      return await response.json();
    },
    onSuccess: (data, variables, context) => {
      toast.success("Transaction deleted");
      queryClient.invalidateQueries({ queryKey: ["transaction", { id }] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      const response = data as ResponseType200;
      response.orderId &&
        queryClient.invalidateQueries({
          queryKey: ["order", { id: response.orderId }],
        });
    },
    onError: () => {
      toast.error("Failed to delete transaction");
    },
  });
  return mutation;
};
