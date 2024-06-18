import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.hair.$post>;
type ResponseType200 = InferResponseType<typeof client.api.hair.$post, 200>;
type RequestType = InferRequestType<typeof client.api.hair.$post>["json"];

export const useCreateHair = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.hair.$post({ json });
      if (!response.ok) {
        throw new Error("Response not ok!");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Hair created");
      queryClient.invalidateQueries({ queryKey: ["hairs"] });
      const response = data as ResponseType200;
      queryClient.invalidateQueries({
        queryKey: ["order", { id: response.data.orderId }],
      });
    },
    onError: () => {
      toast.error("Failed to create hair");
    },
  });
  return mutation;
};
