import apiClient from "@/lib/api-client";
import { technicianEndpoints } from "@/lib/api-endpoints";

export const technicianService = {
  list: async (params?: Record<string, string | number | undefined>) => {
    const response = await apiClient.get(technicianEndpoints.list, { params });
    return response.data;
  },
  detail: async (technicianProfileId: string) => {
    const response = await apiClient.get(technicianEndpoints.detail(technicianProfileId));
    return response.data;
  },
  profile: async () => {
    const response = await apiClient.get(technicianEndpoints.profile);
    return response.data;
  },
  updateProfile: async (payload: Record<string, unknown>) => {
    const response = await apiClient.put(technicianEndpoints.profile, payload);
    return response.data;
  },
  availability: async () => {
    const response = await apiClient.get(technicianEndpoints.availability);
    return response.data;
  },
  updateAvailability: async (payload: Record<string, unknown>) => {
    const response = await apiClient.put(technicianEndpoints.availability, payload);
    return response.data;
  },
  updateBookingStatus: async (bookingId: string, payload: Record<string, unknown>) => {
    const response = await apiClient.patch(technicianEndpoints.bookingStatus(bookingId), payload);
    return response.data;
  },
};
