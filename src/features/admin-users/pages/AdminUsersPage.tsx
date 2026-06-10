import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import type {
  AdminUserUpdatePayload,
  IAdminUser,
} from "@/features/admin-users/types/IAdminUser";
import type { UserRole } from "@/features/auth/types/IUser";
import { useAdminUsers } from "@/features/admin-users/hooks/useAdminUsers";

const roleOptions: UserRole[] = ["STOCK", "PEDIDOS"];

export const AdminUsersPage = () => {
  const [userToEdit, setUserToEdit] = useState<IAdminUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<IAdminUser | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [formData, setFormData] = useState<AdminUserUpdatePayload>({
    nombre: "",
    apellido: "",
    email: "",
    celular: "",
    disabled: false,
  });
  const [error, setError] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | "ALL">("ALL");
  const isAdminUser = (user: IAdminUser) => {
    return user.roles.some((role) => role.rol_codigo === "ADMIN");
  };
  

  const handleCloseEdit = () => {
    setUserToEdit(null);
    setSelectedRoles([]);
    setError("");
  };

  const {
    users,
    isLoading,
    isError,
    updateUserMutation,
    updateRolesMutation,
    deleteUserMutation,
    saveUser,
  } = useAdminUsers({
    selectedRoleFilter,
    setError,
    onDeleteSuccess: () => setUserToDelete(null),
    onEditSuccess: handleCloseEdit,
  });

  const handleOpenEdit = (user: IAdminUser) => {
    if (isAdminUser(user)) {
      setError("No se pueden editar usuarios ADMIN desde esta pantalla.");
      return;
    }

    setError("");
    setUserToEdit(user);
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      celular: user.celular,
      disabled: user.disabled,
    });
    setSelectedRoles(user.roles.map((role) => role.rol_codigo));
  };

  const handleToggleRole = (role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((item) => item !== role)
        : [...prev, role],
    );
  };

  const handleSaveUser = async () => {
    if (!userToEdit) return;

    if (
      !formData.nombre.trim() ||
      !formData.apellido.trim() ||
      !formData.email.trim()
    ) {
      setError("Nombre, apellido y email son obligatorios.");
      return;
    }

    if (selectedRoles.length === 0) {
      setError("El usuario debe tener al menos un rol.");
      return;
    }

    try {
      setError("");
      await saveUser(userToEdit.id, formData, selectedRoles);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el usuario.",
      );
    }
  };

  const columns = useMemo<ColumnDef<IAdminUser>[]>(
    () => [
      {
        header: "Usuario",
        cell: ({ row }) => (
          <span className="font-medium text-gray-800">
            {row.original.nombre} {row.original.apellido}
          </span>
        ),
      },
      {
        header: "Email",
        accessorKey: "email",
        cell: ({ getValue }) => (
          <span className="text-gray-600">{getValue<string>()}</span>
        ),
      },
      {
        header: "Celular",
        cell: ({ row }) => (
          <span className="text-gray-600">{row.original.celular || "—"}</span>
        ),
      },
      {
        id: "roles",
        header: "Roles",
        cell: ({ row }) => (
          <div className="w-[220px] mx-auto flex justify-center flex-wrap gap-1.5">
            {row.original.roles.map((role) => (
              <span
                key={`${row.original.id}-${role.rol_codigo}`}
                className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
              >
                {role.rol_codigo}
              </span>
            ))}
          </div>
        ),
      },
      {
        header: "Estado",
        cell: ({ row }) => (
          <div className="text-center">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                row.original.disabled
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {row.original.disabled ? "Deshabilitado" : "Activo"}
            </span>
          </div>
        ),
      },
      {
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            {isAdminUser(row.original) ? (
              <span className="text-xs text-gray-400">
                Protegido
              </span>
            ) : (
              <>
                <button
                  onClick={() => handleOpenEdit(row.original)}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Editar
                </button>

                <button
                  onClick={() => {
                    setError("");
                    setUserToDelete(row.original);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Cargando usuarios...</p>;
  if (isError) return <p>Hubo un error al cargar los usuarios.</p>;

  return (
    <>
      <div className="w-full max-w-[1200px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} usuarios en total
          </p>
        </div>
        <div className="mb-4">
          <select
            value={selectedRoleFilter}
            onChange={(e) =>
              setSelectedRoleFilter(
                e.target.value as UserRole | "ALL"
              )
            }
            className="w-full sm:w-52 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
              <option value="ALL">Todos los roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STOCK">STOCK</option>
              <option value="PEDIDOS">PEDIDOS</option>              
          </select>
        </div>
        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">
          <div className="mb-4">
          </div> 
          <table className="w-full table-fixed text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`px-4 py-3 text-center font-medium ${
                        header.column.id === "roles" ? "w-[220px]" : ""
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-3 text-center ${
                        cell.column.id === "roles" ? "w-[220px]" : ""
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Editar usuario
              </h2>
              <button
                onClick={handleCloseEdit}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Nombre
                  </label>
                  <input
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-600">
                    Apellido
                  </label>
                  <input
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        apellido: e.target.value,
                      }))
                    }
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Celular
                </label>
                <input
                  value={formData.celular ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      celular: e.target.value || null,
                    }))
                  }
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.disabled}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      disabled: e.target.checked,
                    }))
                  }
                />
                Usuario deshabilitado
              </label>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Roles</p>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role)}
                        onChange={() => handleToggleRole(role)}
                      />
                      {role}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleCloseEdit}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                disabled={
                  updateUserMutation.isPending || updateRolesMutation.isPending
                }
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Confirmar eliminación
              </h2>

              <p className="text-sm text-gray-700">
                ¿Seguro que querés eliminar/deshabilitar a{" "}
                <span className="font-semibold">
                  {userToDelete.nombre} {userToDelete.apellido}
                </span>
                ?
              </p>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteUserMutation.mutate(userToDelete.id)}
                disabled={deleteUserMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleteUserMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};