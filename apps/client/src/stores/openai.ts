import { create } from "zustand";

interface OpenAIStore {
  apiKey: string | null;
}

export const useOpenAiStore = create<OpenAIStore>()(() => ({
  apiKey: openAIKey,
}));
