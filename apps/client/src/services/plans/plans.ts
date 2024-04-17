import { PlanDto, PlanName, PeriodName, SubscriptionWithPlan } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";

import { axios } from "@/client/libs/axios";
import { usePlansStore } from "@/client/stores/plans";

import { PLANS_KEY } from "@/client/constants/query-keys";
import { toast } from "@/client/hooks/use-toast";

export const getPlans = async () => {
  const response = await axios.get<PlanDto[]>("/plans");

  return response.data;
};

export const useGetPlans = () => {
  const {
    error,
    isLoading: loading,
    data: plans,
  } = useQuery({
    queryKey: PLANS_KEY,
    queryFn: getPlans,
  });

  usePlansStore.setState({ plans });

  return { plans, loading, error };
};

export const transformPlan = (
  plan: PlanDto,
  currentPeriod: PeriodName,
) => {
  const planByPeriod = plan[currentPeriod];

  return {
    label: plan.name === "premium" ? "Most popular" : "",
    isHighlighted: plan.name === "premium",
    name: plan.name,
    title: plan.name.replace(/\b\w/g, (match) => match.toUpperCase()),
    price: `$${planByPeriod.price}`,
    buttonText: "Subscribe",
    includes: "This includes",
    resumes: !planByPeriod.max.resumes
      ? `Unlimited`
      : `${planByPeriod.max.resumes} ${planByPeriod.max.resumes > 1 ? "resumes" : "resume"}`,
    downloads: !planByPeriod.max.downloads
      ? `Unlimited`
      : `${planByPeriod.max.downloads} ${planByPeriod.max.downloads > 1 ? "downloads" : "download"}`,
    views: defineViewText(plan.name, planByPeriod.max.resumes),
    sharing: "Resume sharing link",
    alWords: `${planByPeriod.max.alWords} Al words`,
    stripePriceId: planByPeriod.stripePriceId,
  };
};

const defineViewText = (plan: PlanName, viewMax: number | null) => {
  if (!viewMax) return "Unlimited resume views";
  if (plan === "free") return `${viewMax} views for free`;
  return `${viewMax} resume views/month`;
};

export const isSubscribedToFreePlan = (subscription: SubscriptionWithPlan) => {
  return subscription.plan.name === "free";
}

export const ifStartCheckout = (
  plan: PlanDto,
  currentPeriod: "month" | "year",
  subscription: SubscriptionWithPlan,
) => {
  if (plan.name === subscription.plan.name && currentPeriod === subscription.period) {
    toast({
      variant: "success",
      title: `It is your current plan`,
      description: `You are already on the ${plan.name} plan.`,
    });
    return false;
  }

  if (plan.name === "free") {
    toast({
      variant: "error",
      title: `Free plan is basic`,
      description: `You can subscribe to it only once (when creating account)`,
    });
    return false;
  }

  return true;
};
