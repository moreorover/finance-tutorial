import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const useGetOrders = () => {
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await client.api.orders.$get();

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const { data } = await response.json();

      return data.map((order) => ({
        ...order,
        total: convertAmountFromMiliunits(
          order.transactions.reduce((sum, transaction) => {
            return sum + transaction.amount;
          }, 0),
        ),
        transactions: order.transactions.map((transaction) => ({
          ...transaction,
          amount: convertAmountFromMiliunits(transaction.amount),
        })),
      }));
    },
  });

  return query;
};
