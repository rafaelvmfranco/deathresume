import { useMutation } from "@tanstack/react-query";
import { axios } from "@/client/libs/axios";

import { toast } from "@/client/hooks/use-toast";

export const createSubscription = async (
  stripePriceId: string,
) => {
  const response = await axios.post<string>(`/subscription`, {
    stripePriceId
  });

  return response.data;
};

export const useCreateSubscription = () => {
  const { isPending: loading, mutateAsync: createSubscriptionFn } = useMutation<string, string, { stripePriceId: string }>({
    mutationFn: (variables) => createSubscription(variables.stripePriceId),
    onError(error) {
      const message = (error as any)?.message || "Try again later.";

      toast({
        variant: "error",
        title: `Oops, error while creating subscription.`,
        description: message,
      });
    },
  });

  return { createSubscription: createSubscriptionFn, loading };
};