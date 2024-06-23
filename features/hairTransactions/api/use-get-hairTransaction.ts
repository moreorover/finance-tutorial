import { client } from "@/lib/hono";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetHairTransaction = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["hair", { id }],
    queryFn: async () => {
      const response = await client.api.hairTransactions[":id"].$get({
        param: { id },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const data = await response.json();

      return { ...data, price: convertAmountFromMiliUnits(data.price) };
    },
  });

  return query;
};
