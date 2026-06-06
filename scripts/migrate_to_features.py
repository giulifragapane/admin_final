"""One-off migration script: legacy folders -> feature architecture."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

MOVES: list[tuple[str, str]] = [
    ("api/api.ts", "shared/api/client.ts"),
    ("api/auth.service.ts", "features/auth/api/auth.service.ts"),
    ("api/product.service.ts", "features/catalog/products/api/product.service.ts"),
    ("api/categories.service.ts", "features/catalog/categories/api/categories.service.ts"),
    ("api/ingredients.service.ts", "features/catalog/ingredients/api/ingredients.service.ts"),
    ("api/orders.service.ts", "features/orders/api/orders.service.ts"),
    ("api/admin-users.service.ts", "features/admin-users/api/admin-users.service.ts"),
    ("store/auth.store.ts", "features/auth/store/auth.store.ts"),
    ("types/IUser.ts", "features/auth/types/IUser.ts"),
    ("types/IProduct.ts", "features/catalog/products/types/IProduct.ts"),
    ("types/ICategorie.ts", "features/catalog/categories/types/ICategorie.ts"),
    ("types/IIngredient.ts", "features/catalog/ingredients/types/IIngredient.ts"),
    ("types/IOrder.ts", "features/orders/types/IOrder.ts"),
    ("types/IAdminUser.ts", "features/admin-users/types/IAdminUser.ts"),
    ("pages/LoginPage.tsx", "features/auth/pages/LoginPage.tsx"),
    ("pages/ProductsPage.tsx", "features/catalog/products/pages/ProductsPage.tsx"),
    ("pages/ProductDetailPage.tsx", "features/catalog/products/pages/ProductDetailPage.tsx"),
    ("pages/CategoryPage.tsx", "features/catalog/categories/pages/CategoryPage.tsx"),
    ("pages/IngredientsPage.tsx", "features/catalog/ingredients/pages/IngredientsPage.tsx"),
    ("pages/OrdersPage.tsx", "features/orders/pages/OrdersPage.tsx"),
    ("pages/AdminUsersPage.tsx", "features/admin-users/pages/AdminUsersPage.tsx"),
    ("pages/UserPage.tsx", "features/profile/pages/UserPage.tsx"),
    ("components/NavBar/NavBar.tsx", "shared/components/NavBar/NavBar.tsx"),
    ("components/StockBadge/StockBadge.tsx", "shared/components/StockBadge/StockBadge.tsx"),
    (
        "components/modals/ModalProducts/ModalProducts.tsx",
        "features/catalog/products/components/ModalProducts/ModalProducts.tsx",
    ),
    (
        "components/modals/ModalCategories/ModalCategories.tsx",
        "features/catalog/categories/components/ModalCategories/ModalCategories.tsx",
    ),
    (
        "components/modals/CategoryDetailModal/CategoryDetailModal.tsx",
        "features/catalog/categories/components/CategoryDetailModal/CategoryDetailModal.tsx",
    ),
    (
        "components/modals/ModalIngredients/ModalIngredients.tsx",
        "features/catalog/ingredients/components/ModalIngredients/ModalIngredients.tsx",
    ),
    ("routes/ProtectedRoute.tsx", "shared/routes/ProtectedRoute.tsx"),
    ("routes/AppRouter.tsx", "router/AppRouter.tsx"),
    ("hooks/useForm.ts", "shared/hooks/useForm.ts"),
    ("App.tsx", "app/App.tsx"),
    ("main.tsx", "app/main.tsx"),
]

IMPORT_REPLACEMENTS: list[tuple[str, str]] = [
    (r'from "\./api"', 'from "@/shared/api/client"'),
    (r"from '\./api'", "from '@/shared/api/client'"),
    (r'from "\.\./api/api"', 'from "@/shared/api/client"'),
    (r'from "\.\./\.\./\.\./api/api"', 'from "@/shared/api/client"'),
    (r'from "\.\./api/auth\.service"', 'from "@/features/auth/api/auth.service"'),
    (r'from "\.\./store/auth\.store"', 'from "@/features/auth/store/auth.store"'),
    (r'from "\.\./\.\./store/auth\.store"', 'from "@/features/auth/store/auth.store"'),
    (r'from "\.\./types/IUser"', 'from "@/features/auth/types/IUser"'),
    (r'from "\.\./types/IProduct"', 'from "@/features/catalog/products/types/IProduct"'),
    (r'from "\.\./types/ICategorie"', 'from "@/features/catalog/categories/types/ICategorie"'),
    (r'from "\.\./types/IIngredient"', 'from "@/features/catalog/ingredients/types/IIngredient"'),
    (r'from "\.\./types/IOrder"', 'from "@/features/orders/types/IOrder"'),
    (r'from "\.\./types/IAdminUser"', 'from "@/features/admin-users/types/IAdminUser"'),
    (r'from "\./IUser"', 'from "@/features/auth/types/IUser"'),
    (r'from "\./ICategorie"', 'from "@/features/catalog/categories/types/ICategorie"'),
    (r'from "\./IIngredient"', 'from "@/features/catalog/ingredients/types/IIngredient"'),
    (r'from "\.\./\.\./\.\./types/IProduct"', 'from "@/features/catalog/products/types/IProduct"'),
    (r'from "\.\./\.\./\.\./types/ICategorie"', 'from "@/features/catalog/categories/types/ICategorie"'),
    (r'from "\.\./\.\./\.\./types/IIngredient"', 'from "@/features/catalog/ingredients/types/IIngredient"'),
    (r'from "\.\./api/product\.service"', 'from "@/features/catalog/products/api/product.service"'),
    (r'from "\.\./api/categories\.service"', 'from "@/features/catalog/categories/api/categories.service"'),
    (r'from "\.\./api/ingredients\.service"', 'from "@/features/catalog/ingredients/api/ingredients.service"'),
    (r'from "\.\./api/orders\.service"', 'from "@/features/orders/api/orders.service"'),
    (r'from "\.\./api/admin-users\.service"', 'from "@/features/admin-users/api/admin-users.service"'),
    (r'from "\.\./components/StockBadge/StockBadge"', 'from "@/shared/components/StockBadge/StockBadge"'),
    (
        r'from "\.\./components/modals/ModalProducts/ModalProducts"',
        'from "@/features/catalog/products/components/ModalProducts/ModalProducts"',
    ),
    (
        r'from "\.\./components/modals/ModalCategories/ModalCategories"',
        'from "@/features/catalog/categories/components/ModalCategories/ModalCategories"',
    ),
    (
        r'from "\.\./components/modals/CategoryDetailModal/CategoryDetailModal"',
        'from "@/features/catalog/categories/components/CategoryDetailModal/CategoryDetailModal"',
    ),
    (
        r'from "\.\./components/modals/ModalIngredients/ModalIngredients"',
        'from "@/features/catalog/ingredients/components/ModalIngredients/ModalIngredients"',
    ),
    (r'from "\.\./hooks/useForm"', 'from "@/shared/hooks/useForm"'),
    (r'from "\.\./\.\./\.\./hooks/useForm"', 'from "@/shared/hooks/useForm"'),
    (r'from "\./routes/AppRouter"', 'from "@/router/AppRouter"'),
    (r'from "\./ProtectedRoute"', 'from "@/shared/routes/ProtectedRoute"'),
    (r'from "\./App\.tsx"', 'from "@/app/App"'),
    (r'from "\./index\.css"', 'from "@/index.css"'),
    (r'from "\.\./pages/ProductsPage"', 'from "@/features/catalog/products/pages/ProductsPage"'),
    (r'from "\.\./pages/ProductDetailPage"', 'from "@/features/catalog/products/pages/ProductDetailPage"'),
    (r'from "\.\./pages/CategoryPage"', 'from "@/features/catalog/categories/pages/CategoryPage"'),
    (r'from "\.\./pages/IngredientsPage"', 'from "@/features/catalog/ingredients/pages/IngredientsPage"'),
    (r'from "\.\./pages/LoginPage"', 'from "@/features/auth/pages/LoginPage"'),
    (r'from "\.\./pages/OrdersPage"', 'from "@/features/orders/pages/OrdersPage"'),
    (r'from "\.\./pages/AdminUsersPage"', 'from "@/features/admin-users/pages/AdminUsersPage"'),
    (r'from "\.\./pages/UserPage"', 'from "@/features/profile/pages/UserPage"'),
    (r'from "\.\./components/NavBar/NavBar"', 'from "@/shared/components/NavBar/NavBar"'),
]

LEGACY_DIRS = ["api", "pages", "store", "types", "components", "routes", "hooks"]


def transform_content(content: str) -> str:
    for pattern, repl in IMPORT_REPLACEMENTS:
        content = re.sub(pattern, repl, content)
    return content


def copy_and_transform(src_rel: str, dst_rel: str) -> None:
    src = SRC / src_rel
    dst = SRC / dst_rel
    if not src.exists():
        raise FileNotFoundError(src)
    dst.parent.mkdir(parents=True, exist_ok=True)
    text = src.read_text(encoding="utf-8")
    dst.write_text(transform_content(text), encoding="utf-8")


def remove_legacy_dirs() -> None:
    for name in LEGACY_DIRS:
        path = SRC / name
        if path.exists():
            shutil.rmtree(path)
    legacy_app = SRC / "App.tsx"
    if legacy_app.exists():
        legacy_app.unlink()


def main() -> None:
    for src_rel, dst_rel in MOVES:
        copy_and_transform(src_rel, dst_rel)
    remove_legacy_dirs()
    print("Migration copy complete.")


if __name__ == "__main__":
    main()
