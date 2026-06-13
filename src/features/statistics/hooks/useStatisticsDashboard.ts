import { useQuery } from "@tanstack/react-query";
import {
  getOrdersByStatus,
  getRevenueByPaymentMethod,
  getSalesByPeriod,
  getStatisticsSummary,
  getTopProducts,
} from "../api/statistics.service";
import type { SalesGrouping } from "../types/statistics.types";

export const useStatisticsDashboard = (grouping: SalesGrouping) => {
  const summaryQuery = useQuery({
    queryKey: ["statistics", "summary"],
    queryFn: getStatisticsSummary,
    staleTime: 1000 * 60,
  });

  const salesQuery = useQuery({
    queryKey: ["statistics", "sales", grouping],
    queryFn: () => getSalesByPeriod(grouping),
    staleTime: 1000 * 60,
  });

  const topProductsQuery = useQuery({
    queryKey: ["statistics", "top-products"],
    queryFn: () => getTopProducts(5),
    staleTime: 1000 * 60,
  });

  const ordersByStatusQuery = useQuery({
    queryKey: ["statistics", "orders-by-status"],
    queryFn: getOrdersByStatus,
    staleTime: 1000 * 60,
  });

  const revenueByPaymentMethodQuery = useQuery({
    queryKey: ["statistics", "revenue-by-payment-method"],
    queryFn: getRevenueByPaymentMethod,
    staleTime: 1000 * 60,
  });

  const error =
    summaryQuery.error ??
    salesQuery.error ??
    topProductsQuery.error ??
    ordersByStatusQuery.error ??
    revenueByPaymentMethodQuery.error;

  return {
    summary: summaryQuery.data,
    sales: salesQuery.data ?? [],
    topProducts: topProductsQuery.data ?? [],
    ordersByStatus: ordersByStatusQuery.data ?? [],
    revenueByPaymentMethod: revenueByPaymentMethodQuery.data ?? [],
    isLoading:
      summaryQuery.isLoading ||
      salesQuery.isLoading ||
      topProductsQuery.isLoading ||
      ordersByStatusQuery.isLoading ||
      revenueByPaymentMethodQuery.isLoading,
    isError:
      summaryQuery.isError ||
      salesQuery.isError ||
      topProductsQuery.isError ||
      ordersByStatusQuery.isError ||
      revenueByPaymentMethodQuery.isError,
    errorMessage:
      error instanceof Error ? error.message : "Error al cargar estadísticas",
  };
};
