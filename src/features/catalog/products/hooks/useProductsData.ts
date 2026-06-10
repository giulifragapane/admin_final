import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/features/catalog/categories/api/categories.service";
import { getIngredients } from "@/features/catalog/ingredients/api/ingredients.service";
import {
  createProduct,
  deleteProduct,
  getProducts,
  getUnitMeasures,
  updateProduct,
  updateProductAvailability,
} from "@/features/catalog/products/api/product.service";
import type { IProductPayload } from "@/features/catalog/products/types/IProduct";

type UseProductsDataOptions = {
  onCloseModal: () => void;
  onCloseDeleteModal: () => void;
  onCloseStockModal: () => void;
  setStockError: (message: string) => void;
  setDeleteError: (message: string) => void;
};

export const useProductsData = ({
  onCloseModal,
  onCloseDeleteModal,
  onCloseStockModal,
  setStockError,
  setDeleteError,
}: UseProductsDataOptions) => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const ingredientsQuery = useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
    staleTime: 1000 * 60 * 5,
  });

  const unitMeasuresQuery = useQuery({
    queryKey: ["unit-measures"],
    queryFn: getUnitMeasures,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      product,
    }: {
      id: string;
      product: IProductPayload;
    }) => updateProduct(id, product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onCloseModal();
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: ({
      id,
      stock,
      available,
    }: {
      id: string;
      stock: number;
      available: boolean;
    }) => updateProductAvailability(id, { stock, available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onCloseStockModal();
    },
    onError: (error: Error) => {
      setStockError(error.message || "No se pudo actualizar el stock.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onCloseDeleteModal();
    },
    onError: (error: Error) => {
      setDeleteError(error.message || "No se pudo eliminar el producto.");
    },
  });

  const handleCreate = async (newProduct: IProductPayload) => {
    await createMutation.mutateAsync(newProduct);
  };

  const handleUpdate = async (id: string, newProduct: IProductPayload) => {
    await updateMutation.mutateAsync({ id, product: newProduct });
  };

  const loadError =
    productsQuery.error ??
    categoriesQuery.error ??
    ingredientsQuery.error ??
    unitMeasuresQuery.error;

  return {
    products: productsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    ingredients: ingredientsQuery.data ?? [],
    unitMeasures: unitMeasuresQuery.data ?? [],
    isLoading:
      productsQuery.isLoading ||
      categoriesQuery.isLoading ||
      ingredientsQuery.isLoading ||
      unitMeasuresQuery.isLoading,
    isError:
      productsQuery.isError ||
      categoriesQuery.isError ||
      ingredientsQuery.isError ||
      unitMeasuresQuery.isError,
    errorMessage:
      loadError instanceof Error ? loadError.message : "Error al cargar datos",
    handleCreate,
    handleUpdate,
    updateStockMutation,
    deleteMutation,
  };
};
