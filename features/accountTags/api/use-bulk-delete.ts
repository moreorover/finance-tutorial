import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.accountTags)["bulk-delete"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.accountTags)["bulk-delete"]["$post"]
>["json"];

export const useBulkDeleteAccountTags = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.accountTags["bulk-delete"]["$post"]({
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account Tags deleted");
      queryClient.invalidateQueries({ queryKey: ["accountTags"] });
    },
    onError: () => {
      toast.error("Failed to delete account tags");
    },
  });
  return mutation;
};
