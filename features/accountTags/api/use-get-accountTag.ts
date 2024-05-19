import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetAccountTag = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["accountTag", { id }],
    queryFn: async () => {
      const response = await client.api.accountTags[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch account tag");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
