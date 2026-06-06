import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAdminUser,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserRoles,
} from "@/features/admin-users/api/admin-users.service";
import type { AdminUserUpdatePayload } from "@/features/admin-users/types/IAdminUser";
import type { UserRole } from "@/features/auth/types/IUser";

type UseAdminUsersOptions = {
  selectedRoleFilter: UserRole | "ALL";
  setError: (message: string) => void;
  onDeleteSuccess: () => void;
  onEditSuccess: () => void;
};

export const useAdminUsers = ({
  selectedRoleFilter,
  setError,
  onDeleteSuccess,
  onEditSuccess,
}: UseAdminUsersOptions) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin-users", selectedRoleFilter],
    queryFn: () =>
      getAdminUsers(selectedRoleFilter === "ALL" ? undefined : selectedRoleFilter),
    staleTime: 1000 * 60,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: AdminUserUpdatePayload;
    }) => updateAdminUser(id, data),
  });

  const updateRolesMutation = useMutation({
    mutationFn: ({ id, roles }: { id: number; roles: UserRole[] }) =>
      updateAdminUserRoles(id, roles),
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onDeleteSuccess();
    },
    onError: (err: Error) => {
      setError(err.message || "No se pudo eliminar el usuario.");
    },
  });

  const saveUser = async (
    userId: number,
    data: AdminUserUpdatePayload,
    roles: UserRole[],
  ) => {
    await updateUserMutation.mutateAsync({ id: userId, data });
    await updateRolesMutation.mutateAsync({ id: userId, roles });
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    onEditSuccess();
  };

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    updateUserMutation,
    updateRolesMutation,
    deleteUserMutation,
    saveUser,
  };
};
