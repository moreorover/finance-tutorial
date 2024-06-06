import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.hair.$post>;
type RequestType = InferRequestType<typeof client.api.hair.$post>["json"];

export const useCreateHair = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.hair.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Hair created");
      queryClient.invalidateQueries({ queryKey: ["hairs"] });
    },
    onError: () => {
      toast.error("Failed to create hair");
    },
  });
  return mutation;
};
