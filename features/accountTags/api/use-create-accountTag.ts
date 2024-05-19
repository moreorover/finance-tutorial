import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.accountTags.$post>;
type RequestType = InferRequestType<typeof client.api.accountTags.$post>["json"];

export const useCreateAccountTag = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.accountTags.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account tag created");
      queryClient.invalidateQueries({ queryKey: ["accountTags"] });
    },
    onError: () => {
      toast.error("Failed to create account tag");
    },
  });
  return mutation;
};
