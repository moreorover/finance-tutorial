import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";

import { client } from "@/lib/hono";

import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.auth.signup.$post>;
type RequestType = InferRequestType<
  typeof client.api.auth.signup.$post
>["json"];

export const useSignup = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.auth.signup.$post({ json });
      if (!response.ok) {
        throw new Error("Failed to sign up.");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Signed up!");
    },
    onError: () => {
      toast.error("Failed to sign up");
    },
  });
  return mutation;
};
