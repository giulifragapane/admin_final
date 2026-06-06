import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/features/catalog/categories/api/categories.service";
import type { ICategory } from "@/features/catalog/categories/types/ICategorie";

type UseCategoriesDataOptions = {
  onCloseModal: () => void;
  onCloseDeleteModal: () => void;
  setDeleteError: (message: string) => void;
};

export const useCategoriesData = ({
  onCloseModal,
  onCloseDeleteModal,
  setDeleteError,
}: UseCategoriesDataOptions) => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onCloseModal();
    },
    onError: () => {
      console.log("Algo salió mal");
    },
  });

  const editMutation = useMutation({
    mutationFn: ({
      id,
      category,
    }: {
      id: string;
      category: Omit<ICategory, "id">;
    }) => updateCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onCloseModal();
    },
    onError: () => {
      console.log("Algo salió mal");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onCloseDeleteModal();
    },
    onError: (error: Error) => {
      setDeleteError(error.message || "No se pudo eliminar la categoría.");
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    errorMessage:
      categoriesQuery.error instanceof Error
        ? categoriesQuery.error.message
        : "Error al cargar categorías",
    createMutation,
    editMutation,
    deleteMutation,
  };
};
