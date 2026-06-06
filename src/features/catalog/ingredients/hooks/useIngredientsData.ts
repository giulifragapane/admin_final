import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createIngredient,
  deleteIngredient,
  getIngredients,
  updateIngredient,
} from "@/features/catalog/ingredients/api/ingredients.service";

type UseIngredientsDataOptions = {
  onCloseModal: () => void;
  onCloseDeleteModal: () => void;
  setDeleteError: (message: string) => void;
};

export const useIngredientsData = ({
  onCloseModal,
  onCloseDeleteModal,
  setDeleteError,
}: UseIngredientsDataOptions) => {
  const queryClient = useQueryClient();

  const ingredientsQuery = useQuery({
    queryKey: ["ingredients"],
    queryFn: getIngredients,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      onCloseModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ingredient,
    }: {
      id: string;
      ingredient: Parameters<typeof updateIngredient>[1];
    }) => updateIngredient(id, ingredient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      onCloseModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteIngredient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      onCloseDeleteModal();
    },
    onError: (error: Error) => {
      setDeleteError(error.message || "No se pudo eliminar el ingrediente.");
    },
  });

  return {
    ingredients: ingredientsQuery.data ?? [],
    isLoading: ingredientsQuery.isLoading,
    isError: ingredientsQuery.isError,
    errorMessage:
      ingredientsQuery.error instanceof Error
        ? ingredientsQuery.error.message
        : "Error al cargar ingredientes",
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
