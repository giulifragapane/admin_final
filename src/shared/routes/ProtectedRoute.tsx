import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { UserRole } from "@/features/auth/types/IUser";

type Props = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { isLoading, isAuthenticated, hasRole } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Cargando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No tenés permisos para acceder a esta sección.
      </div>
    );
  }

  return children;
};