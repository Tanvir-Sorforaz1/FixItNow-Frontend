import apiClient from "@/lib/api-client";
import { bookingEndpoints } from "@/lib/api-endpoints";

export const bookingService = {
  create: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post(bookingEndpoints.create, payload);
    return response.data;
  },
  list: async () => {
    const response = await apiClient.get(bookingEndpoints.list);
    return response.data;
  },
  detail: async (bookingId: string) => {
    const response = await apiClient.get(bookingEndpoints.detail(bookingId));
    return response.data;
  },
  cancel: async (bookingId: string) => {
    const response = await apiClient.patch(bookingEndpoints.cancel(bookingId));
    return response.data;
  },
};
