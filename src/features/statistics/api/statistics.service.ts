import { api } from "@/shared/api/client";
import type {
  OrdersByStatusItem,
  RevenueByPaymentMethodItem,
  SalesGrouping,
  SalesPeriodItem,
  StatisticsSummary,
  TopProductItem,
} from "../types/statistics.types";

const BASE_URL = "/api/v1/estadisticas";

type StatisticsSummaryApi = {
  ventas_hoy: string;
  ingresos_hoy: string;
  ingresos_mes_actual: string;
  ticket_promedio: string;
  pedidos_activos: number;
  pedidos_total: number;
};

type SalesPeriodItemApi = {
  periodo: string;
  cantidad_pedidos: number;
  total_vendido: string;
};

type TopProductItemApi = {
  producto_id: number;
  producto_nombre: string;
  cantidad_vendida: number;
  ingresos_total: string;
};

type OrdersByStatusItemApi = {
  estado_codigo: string;
  estado_nombre: string;
  cantidad: number;
};

type RevenueByPaymentMethodItemApi = {
  forma_pago_codigo: string;
  forma_pago_nombre: string;
  ingresos_total: string;
  cantidad_pedidos: number;
};

const mapSummaryFromApi = (summary: StatisticsSummaryApi): StatisticsSummary => ({
  todaySales: Number(summary.ventas_hoy),
  todayRevenue: Number(summary.ingresos_hoy),
  currentMonthRevenue: Number(summary.ingresos_mes_actual),
  averageTicket: Number(summary.ticket_promedio),
  activeOrders: summary.pedidos_activos,
  totalOrders: summary.pedidos_total,
});

const mapSalesPeriodFromApi = (item: SalesPeriodItemApi): SalesPeriodItem => ({
  period: item.periodo,
  ordersCount: item.cantidad_pedidos,
  totalSold: Number(item.total_vendido),
});

const mapTopProductFromApi = (item: TopProductItemApi): TopProductItem => ({
  productId: item.producto_id,
  productName: item.producto_nombre,
  quantitySold: item.cantidad_vendida,
  totalRevenue: Number(item.ingresos_total),
});

const mapOrdersByStatusFromApi = (
  item: OrdersByStatusItemApi,
): OrdersByStatusItem => ({
  statusCode: item.estado_codigo,
  statusName: item.estado_nombre,
  quantity: item.cantidad,
});

const mapRevenueByPaymentMethodFromApi = (
  item: RevenueByPaymentMethodItemApi,
): RevenueByPaymentMethodItem => ({
  paymentMethodCode: item.forma_pago_codigo,
  paymentMethodName: item.forma_pago_nombre,
  totalRevenue: Number(item.ingresos_total),
  ordersCount: item.cantidad_pedidos,
});

export const getStatisticsSummary = async (): Promise<StatisticsSummary> => {
  const response = await api.get<StatisticsSummaryApi>(`${BASE_URL}/resumen`);
  return mapSummaryFromApi(response.data);
};

export const getSalesByPeriod = async (
  grouping: SalesGrouping = "day",
): Promise<SalesPeriodItem[]> => {
  const response = await api.get<SalesPeriodItemApi[]>(`${BASE_URL}/ventas`, {
    params: { agrupacion: grouping },
  });

  return response.data.map(mapSalesPeriodFromApi);
};

export const getTopProducts = async (
  limit = 5,
): Promise<TopProductItem[]> => {
  const response = await api.get<TopProductItemApi[]>(
    `${BASE_URL}/productos-top`,
    {
      params: { limit },
    },
  );

  return response.data.map(mapTopProductFromApi);
};

export const getOrdersByStatus = async (): Promise<OrdersByStatusItem[]> => {
  const response = await api.get<OrdersByStatusItemApi[]>(
    `${BASE_URL}/pedidos-por-estado`,
  );

  return response.data.map(mapOrdersByStatusFromApi);
};

export const getRevenueByPaymentMethod = async (): Promise<
  RevenueByPaymentMethodItem[]
> => {
  const response = await api.get<RevenueByPaymentMethodItemApi[]>(
    `${BASE_URL}/ingresos`,
  );

  return response.data.map(mapRevenueByPaymentMethodFromApi);
};
