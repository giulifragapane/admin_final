import { api } from "@/shared/api/client";
import type { IProduct, IProductPayload, IUnitMeasure, } from "@/features/catalog/products/types/IProduct";

const BASE_URL = "/productos/";
const UNITS_URL = "/productos/unidades-medida/";

type UnitMeasureApi = {
  id: number;
  nombre: string;
  abreviatura: string;
};

type UnitMeasuresApiResponse = {
  data: UnitMeasureApi[];
  total: number;
};

type ProductApiCategory = {
  categoria: {
    id: number;
    nombre: string;
    descripcion: string;
    imagen_url: string;
    color: string | null;
    parent_id: number | null;
  };
  es_principal: boolean;
};

type ProductApiIngredient = {
  ingrediente: {
    id: number;
    nombre: string;
    descripcion: string;
    es_alergeno: boolean;
    stock_cantidad: number;
  };
  cantidad: string;
  unidad_medida_id: number | null;
  unidad_medida: UnitMeasureApi | null;
  es_removible: boolean;
};

type ProductApi = {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: string;
  imagenes_url: string[];
  stock_cantidad: number;
  disponible: boolean;
  unidad_venta_id: number | null;
  unidad_venta: UnitMeasureApi | null;
  categorias: ProductApiCategory[];
  ingredientes: ProductApiIngredient[];
};

type ProductsApiResponse = {
  data: ProductApi[];
  total: number;
};

type ProductAvailabilityPayload = {
  stock: number;
  available: boolean;
};

const mapProductFromApi = (product: ProductApi): IProduct => ({
  id: String(product.id),
  name: product.nombre,
  description: product.descripcion,
  price: Number(product.precio_base),
  images: product.imagenes_url ?? [],
  stock: product.stock_cantidad,
  available: product.disponible,
  unitMeasureId: product.unidad_venta_id ? String(product.unidad_venta_id) : null,
  unitMeasure: product.unidad_venta
    ? {
        id: String(product.unidad_venta.id),
        nombre: product.unidad_venta.nombre,
        abreviatura: product.unidad_venta.abreviatura,
      }
    : null,
  categories: (product.categorias ?? []).map((item) => ({
    categoria: {
      id: String(item.categoria.id),
      name: item.categoria.nombre,
      description: item.categoria.descripcion,
      color: item.categoria.color ?? "",
      imageUrl: item.categoria.imagen_url,
      parentId: item.categoria.parent_id
        ? String(item.categoria.parent_id)
        : null,
    },
    es_principal: item.es_principal,
  })),
  ingredients: (product.ingredientes ?? []).map((item) => ({
    ingrediente: {
      id: String(item.ingrediente.id),
      name: item.ingrediente.nombre,
      description: item.ingrediente.descripcion,
      isAllergen: item.ingrediente.es_alergeno,
      stock: item.ingrediente.stock_cantidad ?? 0,
    },
    cantidad: Number(item.cantidad),
    unidad_medida_id: item.unidad_medida_id ? String(item.unidad_medida_id) : null,
    unidad_medida: item.unidad_medida
      ? {
          id: String(item.unidad_medida.id),
          nombre: item.unidad_medida.nombre,
          abreviatura: item.unidad_medida.abreviatura,
        }
      : null,
    es_removible: item.es_removible,
  })),
});

const mapProductToApi = (product: IProductPayload) => ({
  nombre: product.name,
  descripcion: product.description,
  precio_base: product.price,
  imagenes_url: product.images,
  stock_cantidad: product.stock,
  disponible: product.available,
  unidad_venta_id: product.unitMeasureId ? Number(product.unitMeasureId) : null,
  categorias: product.categories.map((item) => ({
    categoria_id: Number(item.categoria_id),
    es_principal: item.es_principal,
  })),
  ingredientes: product.ingredients.map((item) => ({
    ingrediente_id: Number(item.ingrediente_id),
    cantidad: item.cantidad,
    unidad_medida_id: item.unidad_medida_id
      ? Number(item.unidad_medida_id)
      : null,
    es_removible: item.es_removible,
  })),
});

export const getProducts = async (): Promise<IProduct[]> => {
  const response = await api.get<ProductsApiResponse>(BASE_URL);
  return response.data.data.map(mapProductFromApi);
};

export const getProductsById = async (id: string): Promise<IProduct> => {
  const response = await api.get<ProductApi>(`${BASE_URL}${id}`);
  return mapProductFromApi(response.data);
};

export const createProduct = async (
  newProduct: IProductPayload,
): Promise<IProduct> => {
  const response = await api.post<ProductApi>(
    BASE_URL,
    mapProductToApi(newProduct),
  );

  return mapProductFromApi(response.data);
};

export const updateProduct = async (
  id: string,
  product: IProductPayload,
): Promise<IProduct> => {
  const response = await api.patch<ProductApi>(
    `${BASE_URL}${id}`,
    mapProductToApi(product),
  );

  return mapProductFromApi(response.data);
};

export const updateProductAvailability = async (
  id: string,
  data: ProductAvailabilityPayload,
): Promise<IProduct> => {
  const response = await api.patch<ProductApi>(
    `${BASE_URL}${id}/disponibilidad`,
    {
      stock_cantidad: data.stock,
      disponible: data.available,
    },
  );

  return mapProductFromApi(response.data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`${BASE_URL}${id}`);
};

export const getUnitMeasures = async (): Promise<IUnitMeasure[]> => {
  const response = await api.get<UnitMeasuresApiResponse>(UNITS_URL);

  return response.data.data.map((unit) => ({
    id: String(unit.id),
    nombre: unit.nombre,
    abreviatura: unit.abreviatura,
  }));
};