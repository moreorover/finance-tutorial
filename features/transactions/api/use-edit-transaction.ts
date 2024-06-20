import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";
import { useCalculateOrder } from "@/features/orders/api/use-calculate-order";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)[":id"]["$patch"]
>;
type ResponseType200 = InferResponseType<
  (typeof client.api.transactions)[":id"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)[":id"]["$patch"]
>["json"];

export const useEditTransaction = (id?: string) => {
  const queryClient = useQueryClient();
  const calculateOrderMutation = useCalculateOrder();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transactions[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await response.json();
    },
    onSuccess: (data, variables, context) => {
      toast.success("Transaction updated");
      queryClient.invalidateQueries({ queryKey: ["transaction", { id }] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["order", { id: variables.orderId }],
      });

      const response = data as ResponseType200;
      if (response.data.orderId) {
        calculateOrderMutation.mutate({ param: { id: response.data.orderId } });
      }
    },
    onError: () => {
      toast.error("Failed to update transaction");
    },
  });
  return mutation;
};
