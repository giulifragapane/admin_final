import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useStatisticsDashboard } from "../hooks/useStatisticsDashboard";
import type { SalesGrouping } from "../types/statistics.types";

const formatCurrency = (value: number) =>
  value.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const formatNumber = (value: number) => value.toLocaleString("es-AR");

const statusColors: Record<string, string> = {
  PENDIENTE: "#f59e0b",
  CONFIRMADO: "#3b82f6",
  EN_PREP: "#8b5cf6",
  ENTREGADO: "#22c55e",
  CANCELADO: "#ef4444",
};

const paymentColors = ["#2563eb", "#16a34a", "#f97316", "#9333ea"];

export const StatisticsDashboardPage = () => {
  const [grouping, setGrouping] = useState<SalesGrouping>("day");

  const {
    summary,
    sales,
    topProducts,
    ordersByStatus,
    revenueByPaymentMethod,
    isLoading,
    isError,
    errorMessage,
  } = useStatisticsDashboard(grouping);

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <p className="text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Ventas hoy",
      value: formatNumber(summary?.todaySales ?? 0),
      helper: "Pedidos vendidos hoy",
    },
    {
      label: "Ingresos hoy",
      value: formatCurrency(summary?.todayRevenue ?? 0),
      helper: "Total entregado/confirmado",
    },
    {
      label: "Ingresos del mes",
      value: formatCurrency(summary?.currentMonthRevenue ?? 0),
      helper: "Mes actual",
    },
    {
      label: "Ticket promedio",
      value: formatCurrency(summary?.averageTicket ?? 0),
      helper: "Promedio por pedido",
    },
    {
      label: "Pedidos activos",
      value: formatNumber(summary?.activeOrders ?? 0),
      helper: `${formatNumber(summary?.totalOrders ?? 0)} pedidos totales`,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Métricas principales del negocio y pedidos.
          </p>
        </div>

        <select
          value={grouping}
          onChange={(event) => setGrouping(event.target.value as SalesGrouping)}
          className="w-fit rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="day">Ventas por día</option>
          <option value="week">Ventas por semana</option>
          <option value="month">Ventas por mes</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        {kpis.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {item.label}
            </p>
            <p className="mt-2 text-xl font-bold text-gray-900">{item.value}</p>
            <p className="mt-1 text-xs text-gray-500">{item.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Ventas por período</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalSold"
                  name="Total vendido"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot
                />
                <Line
                  type="monotone"
                  dataKey="ordersCount"
                  name="Pedidos"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Top productos</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" />
                <YAxis />
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
                <Legend />
                <Bar dataKey="quantitySold" name="Cantidad vendida" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Pedidos por estado
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="quantity"
                  nameKey="statusName"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {ordersByStatus.map((item) => (
                    <Cell
                      key={item.statusCode}
                      fill={statusColors[item.statusCode] ?? "#64748b"}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Ingresos por forma de pago
          </h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByPaymentMethod} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="paymentMethodName" type="category" width={110} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="totalRevenue" name="Ingresos" fill="#16a34a">
                  {revenueByPaymentMethod.map((item, index) => (
                    <Cell
                      key={item.paymentMethodCode}
                      fill={paymentColors[index % paymentColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};
