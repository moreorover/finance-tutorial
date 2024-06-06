import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.hair)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.hair)[":id"]["$patch"]
>["json"];

export const useEditHair = (id?: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.hair[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Hair updated");
      queryClient.invalidateQueries({ queryKey: ["hair", { id }] });
      queryClient.invalidateQueries({ queryKey: ["hairs"] });
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });
  return mutation;
};
