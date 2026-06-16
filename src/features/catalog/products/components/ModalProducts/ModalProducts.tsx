import { useMemo, useState, type ChangeEvent, type SyntheticEvent } from "react";
import type { IProduct, IProductPayload, IUnitMeasure } from "@/features/catalog/products/types/IProduct";
import type { ICategory } from "@/features/catalog/categories/types/ICategorie";
import type { IIngredient } from "@/features/catalog/ingredients/types/IIngredient";
import { deleteImageFromUrl, uploadImage } from "@/features/uploads/api/upload.service";

type Props = {
  productActive: IProduct | null;
  categories: ICategory[];
  ingredients: IIngredient[];
  unitMeasures: IUnitMeasure[];
  handleCloseModal: VoidFunction;
  handleCreate: (newProduct: IProductPayload) => Promise<void>;
  handleUpdate: (id: string, newProduct: IProductPayload) => Promise<void>;
};

export const ProductModal = ({
  productActive,
  categories,
  ingredients,
  unitMeasures,
  handleCloseModal,
  handleCreate,
  handleUpdate,
}: Props) => {
  const [name, setName] = useState(productActive?.name ?? "");
  const [description, setDescription] = useState(productActive?.description ?? "");
  const [price, setPrice] = useState(productActive ? String(productActive.price) : "");
  const [stock, setStock] = useState(productActive ? String(productActive.stock) : "");
  const [available, setAvailable] = useState(productActive?.available ?? true);
  const [submitError, setSubmitError] = useState("");
  const [imageUrl, setImageUrl] = useState(productActive?.images?.[0] ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [unitMeasureId, setUnitMeasureId] = useState(
    productActive?.unitMeasureId ?? "",
  );

  const [selectedCategories, setSelectedCategories] = useState<
    { categoria_id: string; es_principal: boolean }[]
  >(
    productActive?.categories.map((item) => ({
      categoria_id: item.categoria.id,
      es_principal: item.es_principal,
    })) ?? [],
  );

  const [selectedIngredients, setSelectedIngredients] = useState<
    {
      ingrediente_id: string;
      es_removible: boolean;
      cantidad: string;
      unidad_medida_id: string;
    }[]
  >(
    productActive?.ingredients.map((item) => ({
      ingrediente_id: item.ingrediente.id,
      es_removible: item.es_removible,
      cantidad: String(item.cantidad),
      unidad_medida_id: item.unidad_medida_id ?? "",
    })) ?? [],
  );

  const selectedMainCategoryId = useMemo(() => {
    return selectedCategories.find((item) => item.es_principal)?.categoria_id ?? "";
  }, [selectedCategories]);

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSubmitError("");
    setIsUploadingImage(true);

    try {
      const uploadedImage = await uploadImage(file);
      setImageUrl(uploadedImage.url);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo subir la imagen",
      );
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleDeleteImage = async () => {
    if (!imageUrl) return;

    setSubmitError("");
    setIsDeletingImage(true);

    try {
      await deleteImageFromUrl(imageUrl);
      setImageUrl("");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la imagen de Cloudinary",
      );
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const exists = prev.some((item) => item.categoria_id === categoryId);

      if (exists) {
        return prev.filter((item) => item.categoria_id !== categoryId);
      }

      const shouldBeMain = prev.length === 0;
      return [
        ...prev,
        {
          categoria_id: categoryId,
          es_principal: shouldBeMain,
        },
      ];
    });
  };

  const handleSetMainCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.map((item) => ({
        ...item,
        es_principal: item.categoria_id === categoryId,
      })),
    );
  };

  const handleToggleIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) => {
      const exists = prev.some((item) => item.ingrediente_id === ingredientId);

      if (exists) {
        return prev.filter((item) => item.ingrediente_id !== ingredientId);
      }

      return [
        ...prev,
        {
          ingrediente_id: ingredientId,
          es_removible: false,
          cantidad: "1",
          unidad_medida_id: unitMeasures[0]?.id ?? "",
        },
      ];
    });
  };

  const handleToggleRemovable = (ingredientId: string) => {
    setSelectedIngredients((prev) =>
      prev.map((item) =>
        item.ingrediente_id === ingredientId
          ? { ...item, es_removible: !item.es_removible }
          : item,
      ),
    );
  };

  const handleIngredientQuantityChange = (
    ingredientId: string,
    cantidad: string,
  ) => {
    setSelectedIngredients((prev) =>
      prev.map((item) =>
        item.ingrediente_id === ingredientId
          ? { ...item, cantidad }
          : item,
      ),
    );
  };

  const handleIngredientUnitChange = (
    ingredientId: string,
    unidadMedidaId: string,
  ) => {
    setSelectedIngredients((prev) =>
      prev.map((item) =>
        item.ingrediente_id === ingredientId
          ? { ...item, unidad_medida_id: unidadMedidaId }
          : item,
      ),
    );
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (selectedCategories.length === 0) {
      setSubmitError("Debe seleccionar al menos una categoría");
      return;
    }

    if (!unitMeasureId) {
      setSubmitError("Debe seleccionar una unidad de venta");
      return;
    }

    const ingredientesInvalidos = selectedIngredients.some((item) => {
      const cantidad = Number(item.cantidad);
      return (
        Number.isNaN(cantidad) ||
        cantidad <= 0 ||
        !item.unidad_medida_id
      );
    });

    if (ingredientesInvalidos) {
      setSubmitError(
        "Cada ingrediente debe tener una cantidad mayor a 0 y una unidad de medida",
      );
      return;
    }

    const productData: IProductPayload = {
      name,
      description,
      price: Number(price),
      images: imageUrl ? [imageUrl] : [],
      stock: Number(stock),
      available,
      categories: selectedCategories,
      unitMeasureId,
      ingredients: selectedIngredients.map((item) => ({
        ingrediente_id: item.ingrediente_id,
        es_removible: item.es_removible,
        cantidad: Number(item.cantidad),
        unidad_medida_id: item.unidad_medida_id || null,
      })),
    };

    try {
      if (productActive) {
        await handleUpdate(productActive.id, productData);
      } else {
        await handleCreate(productData);
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo guardar el producto",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {productActive ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            onClick={handleCloseModal}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <form
          id="product-form"
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="px-6 py-5 space-y-6">
            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del producto"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Precio</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Stock</label>
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
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Unidad de venta
              </label>
              <select
                value={unitMeasureId}
                onChange={(e) => setUnitMeasureId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar unidad</option>
                {unitMeasures.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nombre} ({unit.abreviatura})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="available"
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="available" className="text-sm text-gray-700">
                Producto disponible
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Descripción del producto"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Imagen del producto
                </label>
                <p className="text-xs text-gray-400 mt-0.5">
                  Podés subir una imagen a Cloudinary o pegar una URL manualmente.
                </p>
              </div>

              {imageUrl && (
                <div className="space-y-2">
                  <img
                    src={imageUrl}
                    alt="Vista previa del producto"
                    className="w-full h-40 object-cover rounded-lg border border-gray-200"
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

              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />

                <label className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
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
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Categorías
              </h3>

              <div className="space-y-2">
                {categories.map((category) => {
                  const isSelected = selectedCategories.some(
                    (item) => item.categoria_id === category.id,
                  );

                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <label className="flex items-center gap-3 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCategory(category.id)}
                        />
                        <span>{category.name}</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-gray-600">
                        <input
                          type="radio"
                          name="main-category"
                          checked={selectedMainCategoryId === category.id}
                          disabled={!isSelected}
                          onChange={() => handleSetMainCategory(category.id)}
                        />
                        Principal
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Ingredientes
              </h3>

              <div className="space-y-2">
                {ingredients.map((ingredient) => {
                  const selected = selectedIngredients.find(
                    (item) => item.ingrediente_id === ingredient.id,
                  );

                  return (
                    <div
                      key={ingredient.id}
                      className="rounded-lg border border-gray-200 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={!!selected}
                            onChange={() => handleToggleIngredient(ingredient.id)}
                          />
                          <span className="text-sm text-gray-700">
                            {ingredient.name}
                          </span>
                          {ingredient.isAllergen && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700">
                              Alérgeno
                            </span>
                          )}
                        </div>

                        <label className="flex items-center gap-2 text-xs text-gray-600">
                          <input
                            type="checkbox"
                            checked={selected?.es_removible ?? false}
                            disabled={!selected}
                            onChange={() => handleToggleRemovable(ingredient.id)}
                          />
                          Removible
                        </label>
                      </div>

                      {selected && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">
                              Cantidad
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={selected.cantidad}
                              onChange={(e) =>
                                handleIngredientQuantityChange(
                                  ingredient.id,
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-gray-500">
                              Unidad
                            </label>
                            <select
                              value={selected.unidad_medida_id}
                              onChange={(e) =>
                                handleIngredientUnitChange(
                                  ingredient.id,
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                            >
                              <option value="">Seleccionar</option>
                              {unitMeasures.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.nombre} ({unit.abreviatura})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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
            form="product-form"
            disabled={isUploadingImage || isDeletingImage}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {productActive ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </div>
    </div>
  );
};
