export type SalesGrouping = "day" | "week" | "month";

export interface StatisticsSummary {
  todaySales: number;
  todayRevenue: number;
  currentMonthRevenue: number;
  averageTicket: number;
  activeOrders: number;
  totalOrders: number;
}

export interface SalesPeriodItem {
  period: string;
  ordersCount: number;
  totalSold: number;
}

export interface TopProductItem {
  productId: number;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface OrdersByStatusItem {
  statusCode: string;
  statusName: string;
  quantity: number;
}

export interface RevenueByPaymentMethodItem {
  paymentMethodCode: string;
  paymentMethodName: string;
  totalRevenue: number;
  ordersCount: number;
}
