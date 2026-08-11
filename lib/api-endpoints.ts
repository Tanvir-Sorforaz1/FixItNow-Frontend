export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const authEndpoints = {
  register: "/auth/register",
  login: "/auth/login",
  me: "/auth/me",
};

export const userEndpoints = {
  me: "/users/me",
};

export const categoryEndpoints = {
  list: "/categories",
  create: "/categories",
};

export const serviceEndpoints = {
  list: "/services",
  detail: (serviceId: string) => `/services/${serviceId}`,
  create: "/services",
  update: (serviceId: string) => `/services/${serviceId}`,
};

export const technicianEndpoints = {
  list: "/technicians",
  detail: (technicianProfileId: string) => `/technicians/${technicianProfileId}`,
  profile: "/technician/profile",
  availability: "/technician/availability",
  bookings: "/technician/bookings",
  bookingStatus: (bookingId: string) => `/technician/bookings/${bookingId}`,
};

export const bookingEndpoints = {
  create: "/bookings",
  list: "/bookings",
  detail: (bookingId: string) => `/bookings/${bookingId}`,
  cancel: (bookingId: string) => `/bookings/${bookingId}/cancel`,
};

export const reviewEndpoints = {
  create: "/reviews",
};

export const adminEndpoints = {
  users: "/admin/users",
  userStatus: (userId: string) => `/admin/users/${userId}`,
  bookings: "/admin/bookings",
  categories: "/admin/categories",
  createCategory: "/admin/categories",
};

export const paymentEndpoints = {
  list: "/payments",
  detail: (paymentId: string) => `/payments/${paymentId}`,
  create: "/payments/create",
  confirm: "/payments/confirm",
};
