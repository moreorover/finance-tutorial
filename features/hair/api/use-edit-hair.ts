import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";
import { useCalculateOrder } from "@/features/orders/api/use-calculate-order";

type ResponseType = InferResponseType<
  (typeof client.api.hair)[":id"]["$patch"]
>;
type ResponseType200 = InferResponseType<
  (typeof client.api.hair)[":id"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.hair)[":id"]["$patch"]
>["json"];

export const useEditHair = (id?: string) => {
  const queryClient = useQueryClient();
  const calculateOrderMutation = useCalculateOrder();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.hair[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await response.json();
    },
    onSuccess: (data, variables, error) => {
      toast.success("Hair updated");
      queryClient.invalidateQueries({ queryKey: ["hair", { id }] });
      queryClient.invalidateQueries({ queryKey: ["hairs"] });
      const response = data as ResponseType200;
      response.orderId &&
        queryClient.invalidateQueries({
          queryKey: ["order", { id: response.orderId }],
        });

      if (response.orderId) {
        calculateOrderMutation.mutate({ param: { id: response.orderId } });
      }
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
  return mutation;
};
