import { Route, Routes } from "react-router-dom";
import { ProductsPage } from "@/features/catalog/products/pages/ProductsPage";
import { ProductDetailPage } from "@/features/catalog/products/pages/ProductDetailPage";
import { NavBar } from "@/shared/components/NavBar/NavBar";
import { CategoryPage } from "@/features/catalog/categories/pages/CategoryPage";
import { IngredientsPage } from "@/features/catalog/ingredients/pages/IngredientsPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProtectedRoute } from "@/shared/routes/ProtectedRoute";
import { OrdersPage } from "@/features/orders/pages/OrdersPage";
import { AdminUsersPage } from "@/features/admin-users/pages/AdminUsersPage";
import { UserPage } from "@/features/profile/pages/UserPage";
import { StatisticsDashboardPage } from "@/features/statistics/pages/StatisticsDashboardPage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/*"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STOCK", "PEDIDOS"]}>
            <NavBar />
            <main>
              <Routes>
                <Route path="/" element={<ProductsPage />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <StatisticsDashboardPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/categories" element={<CategoryPage />} />
                <Route path="/ingredients" element={<IngredientsPage />} />
                <Route path="/profile" element={<UserPage />} />

                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN", "PEDIDOS"]}>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/users"
                  element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
