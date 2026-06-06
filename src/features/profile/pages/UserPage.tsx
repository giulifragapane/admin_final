import { useProfile } from "@/features/profile/hooks/useProfile";

export const UserPage = () => {
  const { data: user, isLoading, isError } = useProfile();

  if (isLoading) return <p>Cargando perfil...</p>;
  if (isError || !user) return <p>No se pudo cargar el perfil.</p>;

  return (
    <div className="max-w-xl mx-auto px-1 py-2">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Mi perfil
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium">{user.nombre}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Apellido</p>
            <p className="font-medium">{user.apellido}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Celular</p>
            <p className="font-medium">
              {user.celular || "No informado"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                user.disabled
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {user.disabled ? "Deshabilitado" : "Activo"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-2">Roles</p>

          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span
                key={role.rol_codigo}
                className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
              >
                {role.rol_codigo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};