import { UpdateUsageDto } from "@reactive-resume/dto";

import { axios } from "@/client/libs/axios";

export const registerJsonDownload = async () => {
  const response = await axios.patch<UpdateUsageDto>("/usage", {
    action: "increment",
    field: "downloads",
  });

  return response.data;
};