import { PlanDto, PlanName, Period } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";

import { axios } from "@/client/libs/axios";
import { usePlansStore } from "@/client/stores/plans";

import { PLANS_KEY } from "@/client/constants/query-keys";
import { useEffect } from "react";
import set from "lodash.set";

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

export const transformPlan = (plan: PlanDto, currentPeriod: Period) => {
  const planByPeriod = plan[currentPeriod];

  return {
    label: plan.name === "premium" ? "Most popular" : "",
    isHighlighted: plan.name === "premium",
    name: plan.name.replace(/\b\w/g, (match) => match.toUpperCase()),
    price: `$${planByPeriod.price}`,
    buttonText: "Subcribe",
    includes: "This includes",
    resumes: !planByPeriod.max.resumes
      ? `Unlimited`
      : `${planByPeriod.max.resumes} ${planByPeriod.max.resumes > 1 ? "resumes" : "resume"}`,
    downloads: !planByPeriod.max.downloads
      ? `Unlimited`
      : `${planByPeriod.max.downloads} ${planByPeriod.max.downloads > 1 ? "resumes" : "resume"}`,
    views: defineViewText(plan.name, planByPeriod.max.resumes),
    sharing: "Resume sharing link",
    alWords: `${planByPeriod.max.alWords} Al words`,
  };
};

const defineViewText = (plan: PlanName, viewMax: number | null) => {
  if (!viewMax) return "Unlimited resume views";
  if (plan === "free") return `${viewMax} views for free`;
  return `${viewMax} resume views/month`;
};
