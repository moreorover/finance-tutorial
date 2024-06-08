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

      const totalTransactionAmount = data.transactions.reduce(
        (sum, transaction) => {
          return sum + transaction.amount;
        },
        0,
      );

      return {
        ...data,
        total: convertAmountFromMiliunits(totalTransactionAmount),
        transactions: data.transactions.map((transaction) => ({
          ...transaction,
          amount: convertAmountFromMiliunits(transaction.amount),
        })),
      };
    },
  });

  return query;
};
