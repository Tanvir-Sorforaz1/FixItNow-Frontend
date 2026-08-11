import apiClient from "@/lib/api-client";
import { userEndpoints } from "@/lib/api-endpoints";

export const userService = {
  getMe: async () => {
    const response = await apiClient.get(userEndpoints.me);
    return response.data;
  },
  updateMe: async (payload: Record<string, unknown>) => {
    const response = await apiClient.patch(userEndpoints.me, payload);
    return response.data;
  },
};