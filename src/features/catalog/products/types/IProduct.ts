import type { ICategory } from "@/features/catalog/categories/types/ICategorie";
import type { IIngredient } from "@/features/catalog/ingredients/types/IIngredient";

export interface IProductCategoryLink {
  categoria: ICategory;
  es_principal: boolean;
}

export interface IProductIngredientLink {
  ingrediente: IIngredient;
  es_removible: boolean;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  available: boolean;
  categories: IProductCategoryLink[];
  ingredients: IProductIngredientLink[];
}

export interface IProductPayload {
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  available: boolean;
  categories: {
    categoria_id: string;
    es_principal: boolean;
  }[];
  ingredients: {
    ingrediente_id: string;
    es_removible: boolean;
  }[];
}