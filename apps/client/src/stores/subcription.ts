import { SubcriptionWithPlan } from "@reactive-resume/dto";

import { create } from "zustand";


interface SubscriptionState {
    subscription: SubcriptionWithPlan | null;
}

interface SubscriptionActions {
    setSubscription: (subcription: SubcriptionWithPlan) => void;
}

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>((set) => ({
    subscription: null,
    setSubscription: (subscription: SubcriptionWithPlan) => set({ subscription }),
}));
