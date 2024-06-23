import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const useGetHairTransactions = (orderId?: string) => {
  const params = useSearchParams();
  const orderIdParam = orderId ? orderId : params.get("orderId") || "";

  const query = useQuery({
    queryKey: ["hairs"],
    queryFn: async () => {
      const response = await client.api.hairTransactions.$get({
        query: {
          orderId: orderIdParam,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch hair");
      }

      const data = await response.json();

      return data;
    },
  });

  return query;
};
