import { useQuery } from "@tanstack/react-query";

import { axios } from "@/client/libs/axios";
import { useUsageStore } from "@/client/stores/usage";

import { USAGE_KEY } from "@/client/constants/query-keys";
import { UsageDto } from "@reactive-resume/dto";

export const getUsage = async () => {
  const response = await axios.get<UsageDto>("/usage");

  return response.data;
};

export const useGetUsage = () => {
    const {
        error,
        isLoading: loading,
        data: usage,
    } = useQuery({
        queryKey: USAGE_KEY,
        queryFn: getUsage,
    });


    useUsageStore.setState({ usage });

    return { usage, loading, error };
};