import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

const $post = client.api.transactions.$post;

type ResponseType = InferResponseType<typeof $post>;
type RequestType = InferRequestType<typeof $post>["json"];

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await $post({ json });
      return response.json();
    },
    onSuccess: (data, variables, context) => {
      toast.success("Transaction created");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      variables.orderId &&
        queryClient.invalidateQueries({
          queryKey: ["order", { id: variables.orderId }],
        });
    },
    onError: () => {
      toast.error("Failed to create transaction");
    },
  });

  return mutation;
};
