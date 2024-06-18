import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.signin.$post>;
type RequestType = InferRequestType<
  typeof client.api.auth.signin.$post
>["json"];

export const useSignin = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.signin.$post({ json });
      if (!response.ok) {
        throw new Error("Failed to sign in.");
      }
      return await response.json();
    },
    onSuccess: (data, variables, error) => {
      toast.success("Signed in!");
    },
    onError: (data, variables, error) => {
      toast.error("Failed to sign in");
    },
  });
  return mutation;
};
