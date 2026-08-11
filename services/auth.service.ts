import apiClient from "@/lib/api-client";
import { authEndpoints } from "@/lib/api-endpoints";

export const authService = {
  register: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post(authEndpoints.register, payload);
    return response.data;
  },
  login: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post(authEndpoints.login, payload);
    return response.data;
  },
  getMe: async () => {
    const response = await apiClient.get(authEndpoints.me);
    return response.data;
  },
};
