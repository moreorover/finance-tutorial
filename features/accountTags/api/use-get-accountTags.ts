import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetAccountTags = () => {
  const query = useQuery({
    queryKey: ["accountTags"],
    queryFn: async () => {
      const response = await client.api.accountTags.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch account tags");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
