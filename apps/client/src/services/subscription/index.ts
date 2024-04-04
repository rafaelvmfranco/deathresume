import { useQuery } from "@tanstack/react-query";
import { axios } from "@/client/libs/axios";

import { useSubscriptionStore } from "@/client/stores/subscription";
import { SUBSCRIPTION_KEY } from "@/client/constants/query-keys";
import { SubscriptionWithPlan } from "@reactive-resume/dto";

export const getSubscription = async () => {
  const response = await axios.get<SubscriptionWithPlan>(`/subscription`);

  return response.data;
};

export const useGetSubscription = () => {
  const {
    error,
    isLoading: loading,
    data: subscription,
  } = useQuery({
    queryKey: SUBSCRIPTION_KEY,
    queryFn: getSubscription,
  });

  useSubscriptionStore.setState({ subscription });

  return { subscription, loading, error };
};
