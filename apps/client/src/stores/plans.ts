import { PlanDto } from "@reactive-resume/dto";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PlansState {
  plans: PlanDto[];
}

interface PlanActions {
  setPlans: (plans: PlanDto[]) => void;
}

export const usePlansStore = create<PlansState & PlanActions>()((set) => ({
  plans: [],
  setPlans: (plans: PlanDto[]) => set({ plans }),
}));
