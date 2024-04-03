import { UsageDto } from "@reactive-resume/dto";
import { create } from "zustand";


interface UsageState {
    usage: UsageDto;
}

interface UsageActions {
    setUsage: (usage: UsageDto) => void;
}

export const useUsageStore = create<UsageState & UsageActions>((set) => ({
    usage: {
        userId: "",
        resumes: 0,
        downloads: 0,
        views: 0,
        alWords: 0,
    },
    setUsage: (usage: UsageDto) => set({ usage }),
}));
