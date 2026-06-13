import { api } from "@/shared/api/client";
import type { ICategory } from "@/features/catalog/categories/types/ICategorie";

const BASE_URL = "/categorias/";

type CategoryApi = {
  id: string;
  nombre: string;
  descripcion: string;
  color: string | null;
  imagen_url: string;
  parent_id: number | null;
};

type CategoriesApiResponse = {
  data: CategoryApi[];
  total: number;
};

const mapCategoryFromApi = (category: CategoryApi): ICategory => ({
  id: String(category.id),
  name: category.nombre,
  description: category.descripcion,
  color: category.color ?? "",
  parentId: category.parent_id ? String(category.parent_id) : null,
  imageUrl: category.imagen_url || null,
});

const mapCategoryToApi = (category: Omit<ICategory, "id">) => ({
  nombre: category.name,
  descripcion: category.description,
  color: category.color || null,
  imagen_url: category.imageUrl || "",
  parent_id: category.parentId ? Number(category.parentId) : null,
});

export const getCategories = async (): Promise<ICategory[]> => {
  const response = await api.get<CategoriesApiResponse>(BASE_URL);
  return response.data.data.map(mapCategoryFromApi);
};

export const createCategory = async (
  newCategory: Omit<ICategory, "id">,
): Promise<ICategory> => {
  const response = await api.post<CategoryApi>(
    BASE_URL,
    mapCategoryToApi(newCategory),
  );

  return mapCategoryFromApi(response.data);
};

export const updateCategory = async (
  id: string,
  category: Omit<ICategory, "id">,
): Promise<ICategory> => {
  const response = await api.patch<CategoryApi>(
    `${BASE_URL}${id}`,
    mapCategoryToApi(category),
  );

  return mapCategoryFromApi(response.data);
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}${id}`);
};