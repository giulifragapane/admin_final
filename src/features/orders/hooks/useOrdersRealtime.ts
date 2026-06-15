import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

type PedidoRealtimeEvent = {
  type:
    | "PEDIDO_CREATED"
    | "PEDIDO_STATUS_UPDATED"
    | "PEDIDO_CANCELLED"
    | "pedido_creado"
    | "pedido_estado_actualizado"
    | "pedido_cancelado";
  pedido?: unknown;
  pedido_id?: number;
  estado?: string;
};

const getWebSocketUrl = () => {
  const explicitWsUrl = import.meta.env.VITE_WS_URL;

  if (explicitWsUrl) {
    return explicitWsUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const wsBaseUrl = apiUrl.replace(/^http/, "ws").replace(/\/$/, "");

  return `${wsBaseUrl}/api/v1/ws/pedidos`;
};

const isPedidoRealtimeEvent = (type: string) => {
  return [
    "PEDIDO_CREATED",
    "PEDIDO_STATUS_UPDATED",
    "PEDIDO_CANCELLED",
    "pedido_creado",
    "pedido_estado_actualizado",
    "pedido_cancelado",
  ].includes(type);
};

export const useOrdersRealtime = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimeoutId: number | undefined;
    let shouldReconnect = true;

    const invalidateOrders = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.refetchQueries({ queryKey: ["orders"] });
    };

    const connect = () => {
      socket = new WebSocket(getWebSocketUrl());

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as PedidoRealtimeEvent;

          if (isPedidoRealtimeEvent(data.type)) {
            invalidateOrders();
          }
        } catch {
          invalidateOrders();
        }
      };

      socket.onclose = () => {
        if (!shouldReconnect) return;

        reconnectTimeoutId = window.setTimeout(() => {
          connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;

      if (reconnectTimeoutId) {
        window.clearTimeout(reconnectTimeoutId);
      }

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [queryClient]);
};
