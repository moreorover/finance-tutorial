import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.accountTags)[":id"]["$delete"]
>;

export const useDeleteAccountTag = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.accountTags[":id"]["$delete"]({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Account tag deleted");
      queryClient.invalidateQueries({ queryKey: ["accountTag", { id }] });
      queryClient.invalidateQueries({ queryKey: ["accountTags"] });
    },
    onError: () => {
      toast.error("Failed to delete account tag");
    },
  });
  return mutation;
};
