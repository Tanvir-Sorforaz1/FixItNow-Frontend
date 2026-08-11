import apiClient from "@/lib/api-client";
import { adminEndpoints } from "@/lib/api-endpoints";

export const adminService = {
  getUsers: async () => {
    const response = await apiClient.get(adminEndpoints.users);
    return response.data;
  },
  updateUserStatus: async (userId: string, payload: Record<string, unknown>) => {
    const response = await apiClient.patch(adminEndpoints.userStatus(userId), payload);
    return response.data;
  },
  getBookings: async () => {
    const response = await apiClient.get(adminEndpoints.bookings);
    return response.data;
  },
  getCategories: async () => {
    const response = await apiClient.get(adminEndpoints.categories);
    return response.data;
  },
  createCategory: async (payload: Record<string, unknown>) => {
    const response = await apiClient.post(adminEndpoints.createCategory, payload);
    return response.data;
  },
};
