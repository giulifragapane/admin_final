import { useState } from "react";
import type { IOrder, OrderStatus } from "@/features/orders/types/IOrder";
import { useOrdersBoard } from "@/features/orders/hooks/useOrdersBoard";

const orderStatuses: OrderStatus[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "EN_PREP",
  "ENTREGADO",
  "CANCELADO",
];

const statusLabels: Record<OrderStatus, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREP: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const formatMoney = (value: string) => {
  return Number(value).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
};

export const OrdersPage = () => {
  const [selectedStatusByOrder, setSelectedStatusByOrder] = useState<
    Record<number, OrderStatus>
  >({});
  const [errorByOrder, setErrorByOrder] = useState<Record<number, string>>({});

  const { orders, isLoading, isError, updateStatusMutation } = useOrdersBoard({
    setErrorByOrder,
  });

  const handleStatusChange = (orderId: number, status: OrderStatus) => {
    setSelectedStatusByOrder((prev) => ({
      ...prev,
      [orderId]: status,
    }));

    setErrorByOrder((prev) => ({
      ...prev,
      [orderId]: "",
    }));
  };

  const handleUpdateStatus = (order: IOrder) => {
    const nextStatus = selectedStatusByOrder[order.id] ?? order.estado;

    updateStatusMutation.mutate({
      id: order.id,
      estado: nextStatus,
    });
  };

  if (isLoading) return <p>Cargando pedidos...</p>;
  if (isError) return <p>Hubo un error al cargar los pedidos.</p>;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {orders.length} pedidos en total
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {orderStatuses.map((status) => {
          const ordersByStatus = orders.filter(
            (order) => order.estado === status,
          );

          return (
            <section
              key={status}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[340px] flex flex-col"
            >
              <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-base font-bold text-gray-900">
                  {statusLabels[status]}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ordersByStatus.length} pedidos
                </p>
              </div>

              <div className="p-4 space-y-3 overflow-y-auto flex-1">
                {ordersByStatus.length === 0 && (
                  <p className="text-sm text-gray-400">Sin pedidos</p>
                )}

                {ordersByStatus.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          Pedido #{order.id}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Usuario #{order.usuario_id} · Dirección #
                          {order.direccion_entrega_id}
                        </p>
                      </div>

                      <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formatMoney(order.total)}
                      </span>
                    </div>

                    <div className="space-y-1 mb-3">
                      {order.detalles.map((detail) => (
                        <div key={detail.id} className="text-xs text-gray-600">
                          <p>
                            {detail.cantidad} x {detail.producto_nombre} —{" "}
                            {formatMoney(detail.subtotal)}
                          </p>

                          {detail.personalizacion.length > 0 && (
                            <p className="text-[11px] text-amber-700 mt-0.5">
                              Personalización: sin ingredientes #{detail.personalizacion.join(", #")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      Pago:{" "}
                      <span className="font-medium text-gray-700">
                        {order.forma_pago}
                      </span>
                    </p>

                    {status !== "ENTREGADO" && status !== "CANCELADO" && (
                      <div className="flex items-center gap-2">
                        <select
                          value={selectedStatusByOrder[order.id] ?? order.estado}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value as OrderStatus,
                            )
                          }
                          className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                        >
                          {orderStatuses.map((item) => (
                            <option key={item} value={item}>
                              {statusLabels[item]}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => handleUpdateStatus(order)}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                          Actualizar
                        </button>
                      </div>
                    )}

                    {errorByOrder[order.id] && (
                      <p className="mt-2 text-xs text-red-600">
                        {errorByOrder[order.id]}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};