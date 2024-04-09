import { useQuery } from "@tanstack/react-query";

import { SHOW_RESUME_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const ifShowResume = async () => {
  const response = await axios.get<{
    success: boolean;
    errorText?: string;
  }>(`/subscription/show`);

  return response.data;
};

export const useIfShowResume = () => {
  const {
    error,
    isLoading: loading,
    data: isToShow,
  } = useQuery<
    {
      success: boolean;
      errorText?: string;
    },
    string
  >({
    queryKey: [SHOW_RESUME_KEY],
    queryFn: ifShowResume, // Updated line
  });

  return { isToShow, loading, error };
};
