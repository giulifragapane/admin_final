import { api } from "@/shared/api/client";
import type { IIngredient } from "@/features/catalog/ingredients/types/IIngredient";

const BASE_URL = "/ingredientes/";

type IngredientApi = {
  id: number;
  nombre: string;
  descripcion: string;
  es_alergeno: boolean;
  stock_cantidad: number;
};

type IngredientsApiResponse = {
  data: IngredientApi[];
  total: number;
};

export type IngredientPayload = Omit<IIngredient, "id">;

const mapIngredientFromApi = (ingredient: IngredientApi): IIngredient => ({
  id: String(ingredient.id),
  name: ingredient.nombre,
  description: ingredient.descripcion,
  isAllergen: ingredient.es_alergeno,
  stock: ingredient.stock_cantidad,
});

const mapIngredientToApi = (ingredient: IngredientPayload) => ({
  nombre: ingredient.name,
  descripcion: ingredient.description,
  es_alergeno: ingredient.isAllergen,
  stock_cantidad: ingredient.stock,
});

export const getIngredients = async (): Promise<IIngredient[]> => {
  const response = await api.get<IngredientsApiResponse>(BASE_URL);
  return response.data.data.map(mapIngredientFromApi);
};

export const createIngredient = async (
  newIngredient: IngredientPayload,
): Promise<IIngredient> => {
  const response = await api.post<IngredientApi>(
    BASE_URL,
    mapIngredientToApi(newIngredient),
  );

  return mapIngredientFromApi(response.data);
};

export const updateIngredient = async (
  id: string,
  ingredient: IngredientPayload,
): Promise<IIngredient> => {
  const response = await api.patch<IngredientApi>(
    `${BASE_URL}${id}`,
    mapIngredientToApi(ingredient),
  );

  return mapIngredientFromApi(response.data);
};

export const deleteIngredient = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}${id}`);
};