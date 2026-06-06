import { useQuery } from "@tanstack/react-query";
import { getProductsById } from "@/features/catalog/products/api/product.service";

export const useProductDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["product-detail", id],
    queryFn: () => getProductsById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};
