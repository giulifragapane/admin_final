import { api } from "@/shared/api/client";
import type {
  AdminUserUpdatePayload,
  IAdminUser,
} from "@/features/admin-users/types/IAdminUser";
import type { UserRole } from "@/features/auth/types/IUser";

type AdminUsersApiResponse = {
  data: IAdminUser[];
  total: number;
};

export const getAdminUsers = async (
  rol?: UserRole,
): Promise<IAdminUser[]> => {
  const response = await api.get<AdminUsersApiResponse>("/api/v1/admin/usuarios",
  {
    params: rol ? { rol } : {},
  });

  return response.data.data;
};

export const updateAdminUser = async (
  id: number,
  data: AdminUserUpdatePayload,
): Promise<IAdminUser> => {
  const response = await api.patch<IAdminUser>(
    `/api/v1/admin/usuarios/${id}`,
    data,
  );

  return response.data;
};

export const updateAdminUserRoles = async (
  id: number,
  roles: UserRole[],
): Promise<IAdminUser> => {
  const response = await api.patch<IAdminUser>(
    `/api/v1/admin/usuarios/${id}/roles`,
    {
      roles,
    },
  );

  return response.data;
};

export const deleteAdminUser = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/admin/usuarios/${id}`);
};