import apiClient from "@/lib/api-client";
import { categoryEndpoints } from "@/lib/api-endpoints";

export const categoryService = {
  list: async () => {
    const response = await apiClient.get(categoryEndpoints.list);
    return response.data;
  },
  create: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post(categoryEndpoints.create, payload);
    return response.data;
  },
};
