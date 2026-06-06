import { api } from "@/shared/api/client";
import type { IOrder, OrderStatus } from "@/features/orders/types/IOrder";

type OrdersApiResponse = {
  data: IOrder[];
  total: number;
};

export const getOrders = async (): Promise<IOrder[]> => {
  const response = await api.get<OrdersApiResponse>("/api/v1/pedidos/");
  return response.data.data;
};

export const updateOrderStatus = async (
  id: number,
  estado: OrderStatus,
): Promise<IOrder> => {
  const response = await api.patch<IOrder>(`/api/v1/pedidos/${id}/estado`, {
    estado,
  });

  return response.data;
};