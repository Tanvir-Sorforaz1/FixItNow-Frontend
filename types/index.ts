export type UserRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  location?: string;
  image?: string;
}

export interface TechnicianProfile {
  id: string;
  name: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  hourlyRate?: number;
  location?: string;
  service?: string;
  image?: string;
}

export interface BookingItem {
  id: string;
  serviceId?: string;
  serviceName?: string;
  technicianId?: string;
  technicianName?: string;
  status: string;
  date?: string;
  time?: string;
  amount?: number;
}

export interface PaymentItem {
  id: string;
  bookingId?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
}
