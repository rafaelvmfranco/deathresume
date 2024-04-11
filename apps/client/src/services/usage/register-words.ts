import { UpdateUsageDto } from "@reactive-resume/dto";

import { axios } from "@/client/libs/axios";

export const registerAlWords = async (value: number) => {
  if (value === 0) return;

  const response = await axios.patch<UpdateUsageDto>("/usage", {
    action: "increment",
    field: "alWords",
    value,
  });

  return response.data;
};