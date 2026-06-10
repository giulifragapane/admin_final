import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StockBadge } from "@/shared/components/StockBadge/StockBadge";
import type { IProduct } from "@/features/catalog/products/types/IProduct";
import { ProductModal } from "@/features/catalog/products/components/ModalProducts/ModalProducts";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProductsData } from "@/features/catalog/products/hooks/useProductsData";

export const ProductsPage = () => {
  const navigate = useNavigate();

  const hasRole = useAuthStore((state) => state.hasRole);
  const canManageProducts = hasRole(["ADMIN"]);
  const canManageStock = hasRole(["ADMIN", "STOCK"]);

  const [productActive, setProductActive] = useState<IProduct | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<IProduct | null>(null);
  const [productToEditStock, setProductToEditStock] =
    useState<IProduct | null>(null);
  const [stockValue, setStockValue] = useState("");
  const [availableValue, setAvailableValue] = useState(true);
  const [deleteError, setDeleteError] = useState("");
  const [stockError, setStockError] = useState("");

  const handleCloseModal = () => {
    setOpenModal(false);
    setProductActive(null);
  };

  const handleOpenModal = (product: IProduct | null = null) => {
    setProductActive(product);
    setOpenModal(true);
  };

  const handleCloseDeleteModal = () => {
    setProductToDelete(null);
    setDeleteError("");
  };

  const handleOpenStockModal = (product: IProduct) => {
    setProductToEditStock(product);
    setStockValue(String(product.stock));
    setAvailableValue(product.available);
    setStockError("");
  };

  const handleCloseStockModal = () => {
    setProductToEditStock(null);
    setStockValue("");
    setAvailableValue(true);
    setStockError("");
  };

  const {
    products,
    categories,
    ingredients,
    unitMeasures,
    isLoading,
    isError,
    errorMessage,
    handleCreate,
    handleUpdate,
    updateStockMutation,
    deleteMutation,
  } = useProductsData({
    onCloseModal: handleCloseModal,
    onCloseDeleteModal: handleCloseDeleteModal,
    onCloseStockModal: handleCloseStockModal,
    setStockError,
    setDeleteError,
  });

  const handleDeleteClick = (product: IProduct) => {
    setDeleteError("");
    setProductToDelete(product);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    deleteMutation.mutate(productToDelete.id);
  };

  const handleConfirmStockUpdate = () => {
    if (!productToEditStock) return;

    const parsedStock = Number(stockValue);

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setStockError("El stock debe ser un número mayor o igual a 0.");
      return;
    }

    updateStockMutation.mutate({
      id: productToEditStock.id,
      stock: parsedStock,
      available: availableValue,
    });
  };

  if (isLoading) {
    return <p>Cargando productos...</p>;
  }

  if (isError) {
    return (
      <div className="max-w-lg mx-auto mt-10 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <p className="font-medium">No se pudieron cargar los productos</p>
        <p className="mt-1">{errorMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {products.length} productos en total
            </p>
          </div>

          {canManageProducts && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Nuevo producto
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-medium">Imagen</th>
                <th className="px-4 py-3 text-left font-medium">Producto</th>
                <th className="px-4 py-3 text-left font-medium">Categorías</th>
                <th className="px-4 py-3 text-left font-medium">
                  Ingredientes
                </th>
                <th className="px-4 py-3 text-right font-medium">Precio</th>
                <th className="px-4 py-3 text-center font-medium">Stock</th>
                <th className="px-4 py-3 text-center font-medium">Estado</th>
                <th className="px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        —
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {product.name}
                      </span>
                      <span className="text-xs text-gray-500 truncate max-w-[280px]">
                        {product.description || "Sin descripción"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                      {product.categories.length > 0 ? (
                        product.categories.map((item) => (
                          <span
                            key={`${product.id}-cat-${item.categoria.id}`}
                            style={{
                              backgroundColor:
                                item.categoria.color || "#E5E7EB",
                            }}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800"
                          >
                            {item.categoria.name}
                            {item.es_principal ? " ★" : ""}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                      {product.ingredients.length > 0 ? (
                        product.ingredients.map((item) => (
                          <span
                            key={`${product.id}-ing-${item.ingrediente.id}`}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.ingrediente.isAllergen
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.ingrediente.name}
                            {item.cantidad ? ` ${item.cantidad}` : ""}
                            {item.unidad_medida ? ` ${item.unidad_medida.abreviatura}` : ""}
                            {item.es_removible ? " (removible)" : ""}                            
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    ${product.price.toLocaleString("es-AR")}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <StockBadge stock={product.stock} />
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.available ? "Disponible" : "No disponible"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Ver
                      </button>

                      {canManageStock && (
                        <button
                          onClick={() => handleOpenStockModal(product)}
                          className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          Stock
                        </button>
                      )}

                      {canManageProducts && (
                        <>
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-3">📦</p>
              <p className="font-medium text-gray-600">
                No hay productos todavía
              </p>
              {canManageProducts && (
                <p className="text-sm mt-1">
                  Creá el primero haciendo clic en "Nuevo producto"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {openModal && canManageProducts && (
        <ProductModal
          handleCloseModal={handleCloseModal}
          productActive={productActive}
          categories={categories}
          ingredients={ingredients}
          unitMeasures={unitMeasures}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
        />
      )}

      {productToEditStock && canManageStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Actualizar stock
              </h2>
              <button
                onClick={handleCloseStockModal}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-700">
                Producto:{" "}
                <span className="font-semibold">
                  {productToEditStock.name}
                </span>
              </p>

              {stockError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {stockError}
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={availableValue}
                  onChange={(e) => setAvailableValue(e.target.checked)}
                />
                Producto disponible
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleCloseStockModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmStockUpdate}
                disabled={updateStockMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updateStockMutation.isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {productToDelete && canManageProducts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Confirmar eliminación
              </h2>
              <button
                onClick={handleCloseDeleteModal}
                className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                ¿Seguro que querés eliminar el producto{" "}
                <span className="font-semibold">"{productToDelete.name}"</span>?
              </p>

              {deleteError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};