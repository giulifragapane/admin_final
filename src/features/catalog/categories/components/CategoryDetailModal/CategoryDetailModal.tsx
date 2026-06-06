import type { ICategory } from "@/features/catalog/categories/types/ICategorie";

type Props = {
  category: ICategory;
  categories: ICategory[];
  handleCloseModal: VoidFunction;
};

export const CategoryDetailModal = ({ category, categories, handleCloseModal }: Props) => {
  const parent = categories.find(c => c.id === category.parentId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Detalle</h2>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span
              style={{ backgroundColor: category.color }}
              className="w-4 h-4 rounded-full shrink-0"
            />
            <span className="text-base font-bold text-gray-900">
              {category.name}
            </span>
          </div>

          {category.imageUrl && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Imagen
              </span>
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-40 object-cover rounded-xl border border-gray-200"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Descripción
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">
              {category.description || "Sin descripción"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Categoría padre
            </span>
            <p className="text-sm text-gray-700">
              {parent ? parent.name : "Sin categoría padre"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Color
            </span>
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: category.color }}
                className="w-5 h-5 rounded-full border border-gray-200 shrink-0"
              />
              <span className="text-sm text-gray-700 font-mono">
                {category.color}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleCloseModal}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
