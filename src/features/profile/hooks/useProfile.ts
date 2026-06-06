import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/auth/api/auth.service";

export const useProfile = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });
};
