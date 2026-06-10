import { useState, type SyntheticEvent } from "react";
import type { IIngredient } from "@/features/catalog/ingredients/types/IIngredient";

type Props = {
  ingredientActive: IIngredient | null;
  handleCloseModal: VoidFunction;
  handleCreate: (data: Omit<IIngredient, "id">) => Promise<IIngredient>;
  handleUpdate: (id: string, data: Omit<IIngredient, "id">) => Promise<IIngredient>;
};

export const IngredientModal = ({
  ingredientActive,
  handleCloseModal,
  handleCreate,
  handleUpdate,
}: Props) => {
  const [name, setName] = useState(ingredientActive?.name ?? "");
  const [description, setDescription] = useState(
    ingredientActive?.description ?? "",
  );
  const [isAllergen, setIsAllergen] = useState(
    ingredientActive?.isAllergen ?? false,
  );
  const [stock, setStock] = useState(
    ingredientActive ? String(ingredientActive.stock) : "",
  );
  const [error, setError] = useState("");

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!description.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    const parsedStock = Number(stock);

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setError("El stock debe ser un número mayor o igual a 0");
      return;
    }

    try {
      if (ingredientActive) {
        await handleUpdate(ingredientActive.id, {
          name,
          description,
          isAllergen,
          stock: parsedStock,
        });
      } else {
        await handleCreate({
          name,
          description,
          isAllergen,
          stock: parsedStock,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {ingredientActive ? "Editar ingrediente" : "Nuevo ingrediente"}
          </h2>
          <button
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={handleCloseModal}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} id="ingredient-form">
          <div className="px-6 py-5 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del ingrediente"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Breve descripción del ingrediente"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Stock
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isAllergen}
                onChange={(e) => setIsAllergen(e.target.checked)}
              />
              Es alérgeno
            </label>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="ingredient-form"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {ingredientActive ? "Guardar cambios" : "Crear ingrediente"}
          </button>
        </div>
      </div>
    </div>
  );
};