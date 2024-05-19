import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.accounts)[":id"]["updateTags"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.accounts)[":id"]["updateTags"]["$post"]
>["json"];

export const useUpdateAccountTags = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.accounts[":id"].updateTags["$post"]({
        param: { id },
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account tags updated");
      queryClient.invalidateQueries({ queryKey: ["accountTags", { id }] });
      // queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: () => {
      toast.error("Failed to update account tags");
    },
  });
  return mutation;
};
