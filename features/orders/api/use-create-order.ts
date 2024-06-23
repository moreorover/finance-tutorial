import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.orders.$post>;
type RequestType = InferRequestType<typeof client.api.orders.$post>["json"];

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.orders.$post({ json });
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Order created");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast.error("Failed to create order");
    },
  });
  return mutation;
};
