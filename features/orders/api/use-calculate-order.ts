import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type RequestType = InferRequestType<
  (typeof client.api.orders)[":id"]["calculate"]["$post"]
>;

type ResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["calculate"]["$post"]
>;

type ResponseType200 = InferResponseType<
  (typeof client.api.orders)[":id"]["calculate"]["$post"],
  200
>;

export const useCalculateOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (param) => {
      const response = await client.api.orders[":id"]["calculate"]["$post"]({
        ...param,
      });
      return await response.json();
    },
    onSuccess: (data, variables, context) => {
      const response = data as ResponseType200;
      toast.success("Order updated");
      queryClient.invalidateQueries({
        queryKey: ["order", { id: response.data.orderId }],
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
  return mutation;
};
