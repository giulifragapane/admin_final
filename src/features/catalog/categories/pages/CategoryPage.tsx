import { useState } from "react";
import { CategoryModal } from "@/features/catalog/categories/components/ModalCategories/ModalCategories";
import type { ICategory } from "@/features/catalog/categories/types/ICategorie";
import { CategoryDetailModal } from "@/features/catalog/categories/components/CategoryDetailModal/CategoryDetailModal";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCategoriesData } from "@/features/catalog/categories/hooks/useCategoriesData";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; category: ICategory }
  | { type: "detail"; category: ICategory };

export const CategoryPage = () => {
  const hasRole = useAuthStore((state) => state.hasRole);
  const canManageCategories = hasRole(["ADMIN"]);

  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState("");

  const handleCloseModal = () => {
    setModal({ type: "none" });
  };

  const handleCloseDeleteModal = () => {
    setCategoryToDelete(null);
    setDeleteError("");
  };

  const {
    categories,
    isLoading,
    isError,
    errorMessage,
    createMutation,
    editMutation,
    deleteMutation,
  } =
    useCategoriesData({
      onCloseModal: handleCloseModal,
      onCloseDeleteModal: handleCloseDeleteModal,
      setDeleteError,
    });

  const handleDeleteClick = (category: ICategory) => {
    setDeleteError("");
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) return;
    deleteMutation.mutate(categoryToDelete.id);
  };

  if (isLoading) return <p>Cargando categorías...</p>;
  if (isError) {
    return (
      <div className="max-w-lg mx-auto mt-10 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <p className="font-medium">No se pudieron cargar las categorías</p>
        <p className="mt-1">{errorMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto px-1 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {categories.length} categorías en total
            </p>
          </div>

          {canManageCategories && (
            <button
              onClick={() => setModal({ type: "create" })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Nueva categoría
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-medium">Imágen</th>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">
                  Descripción
                </th>
                <th className="px-4 py-3 text-center font-medium">Color</th>
                <th className="px-4 py-3 text-left font-medium">Padre</th>
                <th className="px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {categories.map((category: ICategory) => (
                <tr
                  key={category.id}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        —
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      style={{ backgroundColor: category.color || "#E5E7EB" }}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-gray-800"
                    >
                      {category.name}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {category.description || "—"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        style={{ backgroundColor: category.color || "#E5E7EB" }}
                        className="w-4 h-4 rounded-full border border-gray-200"
                      />
                      <span className="text-xs text-gray-500 font-mono">
                        {category.color || "Sin color"}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-500">
                    {categories.find((cat) => cat.id === category.parentId)
                      ?.name ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setModal({ type: "detail", category })}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Ver
                      </button>

                      {canManageCategories && (
                        <>
                          <button
                            onClick={() => setModal({ type: "edit", category })}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => handleDeleteClick(category)}
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

          {categories.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-3">🏷️</p>
              <p className="font-medium text-gray-600">
                No hay categorías todavía
              </p>
              {canManageCategories && (
                <p className="text-sm mt-1">
                  Creá la primera haciendo clic en "Nueva categoría"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {modal.type === "edit" && canManageCategories && (
        <CategoryModal
          categoryActive={modal.category}
          categories={categories}
          handleCreate={async (data) => {
            await editMutation.mutateAsync({
              id: modal.category.id,
              category: data,
            });
          }}
          handleCloseModal={handleCloseModal}
        />
      )}

      {modal.type === "create" && canManageCategories && (
        <CategoryModal
          categoryActive={null}
          categories={categories}
          handleCreate={async (data) => {
            await createMutation.mutateAsync(data);
          }}
          handleCloseModal={handleCloseModal}
        />
      )}

      {modal.type === "detail" && (
        <CategoryDetailModal
          category={modal.category}
          categories={categories}
          handleCloseModal={handleCloseModal}
        />
      )}

      {categoryToDelete && canManageCategories && (
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
                ¿Seguro que querés eliminar la categoría{" "}
                <span className="font-semibold">
                  "{categoryToDelete.name}"
                </span>
                ?
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