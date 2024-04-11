import { UpdateUsageDto } from "@reactive-resume/dto";

import { axios } from "@/client/libs/axios";

export const registerView = async () => {
  const response = await axios.patch<UpdateUsageDto>("/usage", {
    action: "increment",
    field: "views",
  });

  return response.data;
};