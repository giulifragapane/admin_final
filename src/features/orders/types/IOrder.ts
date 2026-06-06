export type OrderStatus =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "EN_PREP"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

export type PaymentMethod = "EFECTIVO" | "MERCADOPAGO";

export interface IOrderDetail {
  id: number;
  producto_id: number;
  cantidad: number;
  producto_nombre: string;
  precio_unitario: string;
  subtotal: string;
}

export interface IOrder {
  id: number;
  usuario_id: number;
  direccion_entrega_id: number;
  estado: OrderStatus;
  forma_pago: PaymentMethod;
  total: string;
  detalles: IOrderDetail[];
}