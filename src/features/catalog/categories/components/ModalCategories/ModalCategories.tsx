import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import type { ICategory } from "@/features/catalog/categories/types/ICategorie";
import { useForm } from "@/shared/hooks/useForm";
import { deleteImageFromUrl, uploadImage } from "@/features/uploads/api/upload.service";

type IColor = {
  label: string;
  value: string;
};

const colorOptions: IColor[] = [
  { label: "Azul", value: "#3B82F6" },
  { label: "Verde", value: "#22C55E" },
  { label: "Rojo", value: "#EF4444" },
  { label: "Naranja", value: "#F97316" },
  { label: "Violeta", value: "#A855F7" },
  { label: "Rosa", value: "#EC4899" },
];

type CategoryFormState = {
  name: string;
  description: string;
};

type Props = {
  categoryActive: ICategory | null;
  categories: ICategory[];
  handleCloseModal: VoidFunction;
  handleCreate?: (category: Omit<ICategory, "id">) => Promise<void>;
};

export const CategoryModal = ({
  categoryActive,
  categories,
  handleCloseModal,
  handleCreate,
}: Props) => {
  const initialColor =
    colorOptions.find((c) => c.value === categoryActive?.color) ??
    colorOptions[0];
  const [tagColor, setTagColor] = useState<IColor>(initialColor);
  const [error, setError] = useState("");
  const [parentId, setParentId] = useState<string>(
    categoryActive?.parentId ?? "",
  );
  const [imageUrl, setImageUrl] = useState(categoryActive?.imageUrl ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);

  const { formState, handleChange } = useForm<CategoryFormState>({
    name: categoryActive?.name ?? "",
    description: categoryActive?.description ?? "",
  });

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setIsUploadingImage(true);

    try {
      const uploadedImage = await uploadImage(file);
      setImageUrl(uploadedImage.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir la imagen",
      );
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!imageUrl) return;

    setError("");
    setIsDeletingImage(true);

    try {
      await deleteImageFromUrl(imageUrl);
      setImageUrl("");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la imagen de Cloudinary",
      );
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!formState.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!formState.description.trim()) {
      setError("La descripción es obligatoria");
      return;
    }

    const categoryData: Omit<ICategory, "id"> = {
      name: formState.name,
      description: formState.description,
      color: tagColor.value,
      parentId: parentId || null,
      imageUrl: imageUrl || null,
    };

    try {
      if (handleCreate) {
        await handleCreate(categoryData);
      }

      handleCloseModal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la categoría",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {categoryActive ? "Editar categoría" : "Nueva categoría"}
          </h2>
          <button
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={handleCloseModal}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} id="category-form" className="overflow-y-auto">
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
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Nombre de la categoría"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Descripción
              </label>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleChange}
                rows={3}
                placeholder="Breve descripción de la categoría"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Imagen de categoría
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Podés subir una imagen a Cloudinary o pegar una URL manualmente.
                </p>
              </div>

              {imageUrl && (
                <div className="space-y-2">
                  <img
                    src={imageUrl}
                    alt="Vista previa de categoría"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />

                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={isDeletingImage || isUploadingImage}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isDeletingImage ? "Eliminando..." : "Eliminar imagen"}
                  </button>
                </div>
              )}

              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />

              <label className={`inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isUploadingImage
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
              }`}>
                {isUploadingImage ? "Subiendo..." : "Subir imagen"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={isUploadingImage || isDeletingImage}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Categoría padre
              </label>

              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin categoría padre</option>

                {categories
                  .filter((category) => category.id !== categoryActive?.id)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>

              <p className="text-xs text-gray-400">
                Si no seleccionás una, será una categoría raíz.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">
                Color de etiqueta
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    title={opt.label}
                    onClick={() => setTagColor(opt)}
                    style={{ backgroundColor: opt.value }}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-2 ${
                      tagColor.value === opt.value
                        ? "ring-gray-600"
                        : "ring-transparent"
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">Vista previa:</span>
                <span
                  style={{ backgroundColor: tagColor.value }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                >
                  {formState.name || "Categoría"}
                </span>
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={handleCloseModal}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={isUploadingImage || isDeletingImage}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {categoryActive ? "Guardar cambios" : "Crear categoría"}
          </button>
        </div>
      </div>
    </div>
  );
};
