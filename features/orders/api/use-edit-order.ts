import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.orders)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.orders)[":id"]["$patch"]
>["json"];

export const useEditOrder = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.orders[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["order", { id }] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
  return mutation;
};
