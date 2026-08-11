import apiClient from "@/lib/api-client";
import { paymentEndpoints } from "@/lib/api-endpoints";

export const paymentService = {
  list: async () => {
    const response = await apiClient.get(paymentEndpoints.list);
    return response.data;
  },
  detail: async (paymentId: string) => {
    const response = await apiClient.get(paymentEndpoints.detail(paymentId));
    return response.data;
  },
  create: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post(paymentEndpoints.create, payload);
    return response.data;
  },
  confirm: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post(paymentEndpoints.confirm, payload);
    return response.data;
  },
};
