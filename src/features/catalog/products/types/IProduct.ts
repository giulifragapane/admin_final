import type { ICategory } from "@/features/catalog/categories/types/ICategorie";
import type { IIngredient } from "@/features/catalog/ingredients/types/IIngredient";

export interface IUnitMeasure {
  id: string;
  nombre: string;
  abreviatura: string;
}

export interface IProductCategoryLink {
  categoria: ICategory;
  es_principal: boolean;
}

export interface IProductIngredientLink {
  ingrediente: IIngredient;
  es_removible: boolean;
  cantidad: number;
  unidad_medida_id: string | null;
  unidad_medida: IUnitMeasure | null;
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
  unitMeasureId: string | null;
  unitMeasure: IUnitMeasure | null;
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
    cantidad: number;
    unidad_medida_id: string | null;
  }[];
  unitMeasureId: string | null;
}