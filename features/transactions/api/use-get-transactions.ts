import { client } from "@/lib/hono";
import { convertAmountFromMiliUnits } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const useGetTransactions = (orderId?: string) => {
  const params = useSearchParams();
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const accountId = params.get("accountId") || "";
  const orderIparam = orderId ? orderId : params.get("orderId") || "";

  const query = useQuery({
    // TODO: Check if params are needed in the key
    queryKey: ["transactions", { from, to, accountId, orderId }],
    // queryKey: ["transactions"],
    queryFn: async () => {
      const response = await client.api.transactions.$get({
        query: {
          from,
          to,
          accountId,
          orderId: orderIparam,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }

      const { data } = await response.json();

      return data.map((transaction) => ({
        ...transaction,
        amount: convertAmountFromMiliUnits(transaction.amount),
      }));
    },
  });

  return query;
};
