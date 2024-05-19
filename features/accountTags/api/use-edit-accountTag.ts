import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.accountTags)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.accountTags)[":id"]["$patch"]
>["json"];

export const useEditAccountTag = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.accountTags[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account tag updated");
      queryClient.invalidateQueries({ queryKey: ["accountTag", { id }] });
      queryClient.invalidateQueries({ queryKey: ["accountTags"] });
    },
    onError: () => {
      toast.error("Failed to update account tag");
    },
  });
  return mutation;
};
