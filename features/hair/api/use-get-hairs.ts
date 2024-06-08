import { client } from "@/lib/hono";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

export const useGetHairs = (orderId?: string) => {
  const params = useSearchParams();
  const sellerId = params.get("sellerId") || "";
  const orderIdParam = orderId ? orderId : params.get("orderId") || "";

  const query = useQuery({
    queryKey: ["hairs"],
    queryFn: async () => {
      const response = await client.api.hair.$get({
        query: {
          orderId: orderIdParam,
          sellerId: sellerId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch hair");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
