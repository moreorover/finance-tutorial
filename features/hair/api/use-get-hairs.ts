import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const useGetHairs = (orderId?: string, inStock?: "true") => {
  const params = useSearchParams();
  // const inStock2 = params.get("inStock");
  const orderIdParam = orderId ? orderId : params.get("orderId") || "";
  const inStockParam = inStock == "true" ? "true" : "";

  const query = useQuery({
    queryKey: ["hairs"],
    queryFn: async () => {
      const response = await client.api.hair.$get({
        query: {
          orderId: orderIdParam,
          inStock: inStockParam,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch hair");
      }

      return await response.json();
    },
  });

  return query;
};
