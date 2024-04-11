import { useQuery } from "@tanstack/react-query";

import { SHOW_RESUME_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";
import { toast } from "@/client/hooks/use-toast";

type ShowResumeResponse = { [key: string]: { success: boolean; errorText?: string } };

export const ifShowResume = async () => {
  const response = await axios.get<ShowResumeResponse>(`/subscription/show`);

  return response.data;
};

export async function checkIfViewAndPaid(): Promise<{success: boolean, errorText: string}> {
  const response = await ifShowResume();

  const isForView = response?.views?.success;
  const isPaid = response?.payment?.success;

  let errorText = "";

  if (!isForView) errorText = response?.views?.errorText || "";
  if (!isPaid) errorText = response?.payment?.errorText || "";

  return {
    success: isForView && isPaid,
    errorText, 
  };
}

export const useIfShowResume = () => {
  const {
    error,
    isLoading: loading,
    data: isToShow,
  } = useQuery<{
    success: boolean;
    errorText?: string;
  }, string>({
    queryKey: [SHOW_RESUME_KEY],
    queryFn: checkIfViewAndPaid,
    staleTime: 0,
  });

  return { isToShow, loading, error };
};



export async function checkIfDownload() {
  const response = await ifShowResume();

  if (response?.downloads?.success) return true;

  toast({
    variant: "error",
    title: `Upgrade your plan.`,
    description: response?.downloads?.errorText,
  });

  return false;
}

export async function checkIfCreateOrDuplicate() {
  const response = await ifShowResume();

  if (response?.resumes?.success) return true;

  toast({
    variant: "error",
    title: `Upgrade your plan.`,
    description: response?.resumes?.errorText,
  });

  return false;
}

export async function checkIfUseAlWords() {
  const response = await ifShowResume();

  if (response?.alWords?.success) return true;

  toast({
    variant: "error",
    title: `Upgrade your plan.`,
    description: response?.alWords?.errorText,
  });

  return false;
}

