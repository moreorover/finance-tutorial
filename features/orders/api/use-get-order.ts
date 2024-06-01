import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetOrder = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["order", { id }],
    queryFn: async () => {
      const response = await client.api.orders[":id"].$get({ param: { id } });

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const { data } = await response.json();

      return { ...data, total: convertAmountFromMiliunits(data.total) };
    },
  });

  return query;
};
