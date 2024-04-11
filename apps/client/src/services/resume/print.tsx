import { t } from "@lingui/macro";
import { UpdateUsageDto, UrlDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";

import { toast } from "@/client/hooks/use-toast";
import { axios } from "@/client/libs/axios";

export const printResume = async (data: { id: string, isPublic?: boolean}) => {
  const response = await axios.get<UrlDto>(`/resume/print/${data.id}?isPublic=${data.isPublic || false}`);

  return response.data;
};

export const registerJsonDownload = async () => {
  const response = await axios.patch<UpdateUsageDto>("/usage", {
    action: "increment",
    field: "downloads",
  });

  return response.data;
};

export const usePrintResume = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: printResumeFn,
  } = useMutation({
    mutationFn: printResume,
    onError: (error) => {
      const message = error?.message;

      toast({
        variant: "error",
        title: t`Oops, the server returned an error.`,
        description: message,
      });
    },
  });

  return { printResume: printResumeFn, loading, error };
};
