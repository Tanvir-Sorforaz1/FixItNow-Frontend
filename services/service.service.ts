import apiClient from "@/lib/api-client";
import { serviceEndpoints } from "@/lib/api-endpoints";

export const serviceService = {
  list: async (params?: Record<string, string | number | undefined>) => {
    const response = await apiClient.get(serviceEndpoints.list, { params });
    return response.data;
  },
  detail: async (serviceId: string) => {
    const response = await apiClient.get(serviceEndpoints.detail(serviceId));
    return response.data;
  },
  create: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post(serviceEndpoints.create, payload);
    return response.data;
  },
  update: async (serviceId: string, payload: Record<string, unknown>) => {
    const response = await apiClient.patch(serviceEndpoints.update(serviceId), payload);
    return response.data;
  },
};
