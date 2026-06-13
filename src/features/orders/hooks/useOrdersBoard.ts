import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import {
  getOrders,
  updateOrderStatus,
} from "@/features/orders/api/orders.service";
import type { OrderStatus } from "@/features/orders/types/IOrder";
import { useOrdersRealtime } from "./useOrdersRealtime";

type UseOrdersBoardOptions = {
  setErrorByOrder: Dispatch<SetStateAction<Record<number, string>>>;
};

export const useOrdersBoard = ({ setErrorByOrder }: UseOrdersBoardOptions) => {
  const queryClient = useQueryClient();

  useOrdersRealtime();

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    staleTime: 1000 * 30,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: OrderStatus }) =>
      updateOrderStatus(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: Error, variables) => {
      setErrorByOrder((prev) => ({
        ...prev,
        [variables.id]: error.message || "No se pudo actualizar el pedido.",
      }));
    },
  });

  return {
    orders: ordersQuery.data ?? [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    updateStatusMutation,
  };
};
