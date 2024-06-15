import { client } from "@/lib/hono";
import { convertAmountFromMiliunits } from "@/lib/utils";
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

      const { data } = await response.json();

      return { ...data, price: convertAmountFromMiliunits(data.price) };
    },
  });

  return query;
};
