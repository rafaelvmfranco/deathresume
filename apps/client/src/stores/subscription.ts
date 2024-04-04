import { SubscriptionWithPlan } from "@reactive-resume/dto";

import { create } from "zustand";


interface SubscriptionState {
    subscription: SubscriptionWithPlan | null;
}

interface SubscriptionActions {
    setSubscription: (subscription: SubscriptionWithPlan) => void;
}

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>((set) => ({
    subscription: null,
    setSubscription: (subscription: SubscriptionWithPlan) => set({ subscription }),
}));
