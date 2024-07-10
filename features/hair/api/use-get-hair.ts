import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";

export const useGetHair = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["hair", { id }],
    queryFn: async () => {
      const response = await client.api.hair[":id"].$get({ param: { id } });

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      return await response.json();
    },
  });

  return query;
};
