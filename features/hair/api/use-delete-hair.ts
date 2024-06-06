import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.hair)[":id"]["$delete"]
>;

export const useDeleteHair = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.hair[":id"]["$delete"]({
        param: { id },
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Hair deleted");
      queryClient.invalidateQueries({ queryKey: ["hair", { id }] });
      queryClient.invalidateQueries({ queryKey: ["hairs"] });
    },
    onError: () => {
      toast.error("Failed to delete order");
    },
  });
  return mutation;
};
