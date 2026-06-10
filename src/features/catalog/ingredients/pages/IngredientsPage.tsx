import { useState } from "react";
import type { IIngredient } from "@/features/catalog/ingredients/types/IIngredient";
import { IngredientModal } from "@/features/catalog/ingredients/components/ModalIngredients/ModalIngredients";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useIngredientsData } from "@/features/catalog/ingredients/hooks/useIngredientsData";

export const IngredientsPage = () => {

  const hasRole = useAuthStore((state) => state.hasRole);
  const canManageIngredients = hasRole(["ADMIN"]);

  const [ingredientActive, setIngredientActive] =
    useState<IIngredient | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] =
    useState<IIngredient | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const handleCloseModal = () => {
    setOpenModal(false);
    setIngredientActive(null);
  };

  const handleOpenModal = (ingredient: IIngredient | null = null) => {
    setIngredientActive(ingredient);
    setOpenModal(true);
  };

  const handleCloseDeleteModal = () => {
    setIngredientToDelete(null);
    setDeleteError("");
  };

  const {
    ingredients,
    isLoading,
    isError,
    errorMessage,
    createMutation,
    updateMutation,
    deleteMutation,
  } =
    useIngredientsData({
      onCloseModal: handleCloseModal,
      onCloseDeleteModal: handleCloseDeleteModal,
      setDeleteError,
    });

  if (isLoading) return <p>Cargando ingredientes...</p>;
  if (isError) {
    return (
      <div className="max-w-lg mx-auto mt-10 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <p className="font-medium">No se pudieron cargar los ingredientes</p>
        <p className="mt-1">{errorMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ingredientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {ingredients.length} ingredientes en total
            </p>
          </div>

          {canManageIngredients && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Nuevo ingrediente
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">
                  Descripción
                </th>
                <th className="px-4 py-3 text-center font-medium">Stock</th>
                <th className="px-4 py-3 text-center font-medium">
                  Es alérgeno
                </th>
                <th className="px-4 py-3 text-center font-medium">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {ingredients.map((ingredient) => (
                <tr
                  key={ingredient.id}
                  className="hover:bg-blue-50/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">
                      {ingredient.name}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                    {ingredient.description || "—"}
                  </td>

                  <td className="px-4 py-3 text-center text-gray-700">
                    {ingredient.stock}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ingredient.isAllergen
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {ingredient.isAllergen ? "Sí" : "No"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {canManageIngredients ? (
                        <>
                          <button
                            onClick={() => handleOpenModal(ingredient)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => {
                              setDeleteError("");
                              setIngredientToDelete(ingredient);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Solo lectura
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {ingredients.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <p className="text-4xl mb-3">🧂</p>
              <p className="font-medium text-gray-600">
                No hay ingredientes todavía
              </p>
              {canManageIngredients && (
                <p className="text-sm mt-1">
                  Creá el primero haciendo clic en "Nuevo ingrediente"
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {openModal && canManageIngredients && (
        <IngredientModal
          ingredientActive={ingredientActive}
          handleCloseModal={handleCloseModal}
          handleCreate={(data) => createMutation.mutateAsync(data)}
          handleUpdate={(id, data) =>
            updateMutation.mutateAsync({ id, ingredient: data })
          }
        />
      )}

      {ingredientToDelete && canManageIngredients && (
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
                ¿Seguro que querés eliminar el ingrediente{" "}
                <span className="font-semibold">
                  "{ingredientToDelete.name}"
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
                onClick={() => deleteMutation.mutate(ingredientToDelete.id)}
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