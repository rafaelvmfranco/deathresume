import { useMutation } from "@tanstack/react-query";
import { axios } from "@/client/libs/axios";

import { toast } from "@/client/hooks/use-toast";

export const updateSubscription = async (
  stripePriceId: string,
  subscriptionId: string,
) => {
  const response = await axios.patch<string>(`/subscription`, {
    stripePriceId,
    subscriptionId,
  });

  return response.data;
};

export const useUpdateSubscription = () => {
const { isPending: loading, mutateAsync: updateSubscriptionFn } = useMutation<string, string, { stripePriceId: string, subscriptionId: string }>({
    mutationFn: (variables) => updateSubscription(variables.stripePriceId, variables.subscriptionId),
    onError(error) {
        const message = (error as any)?.message || "Try again later.";

        toast({
            variant: "error",
            title: `Oops, error while updating subscription.`,
            description: message,
        });
    },
});

  return { updateSubscription: updateSubscriptionFn, updateLoading: loading };
};