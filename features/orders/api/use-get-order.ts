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

      return {
        ...data,
        total: convertAmountFromMiliunits(data.total),
        transactions: data.transactions.map((transaction) => ({
          ...transaction,
          amount: convertAmountFromMiliunits(transaction.amount),
        })),
        hair: data.hair.map((hair) => ({
          ...hair,
          price: convertAmountFromMiliunits(hair.price),
        })),
        hairTotal:
          convertAmountFromMiliunits(
            data.hair.reduce((sum, h) => {
              return sum + h.price;
            }, 0),
          ) || 0,
      };
    },
  });

  return query;
};
