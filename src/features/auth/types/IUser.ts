export type UserRole = "ADMIN" | "STOCK" | "PEDIDOS" | "CLIENT";

export interface IUserRole {
  rol_codigo: UserRole;
}

export interface IUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: string | null;
  disabled: boolean;
  roles: IUserRole[];
}