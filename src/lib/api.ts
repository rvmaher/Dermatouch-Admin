import axios from "axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  Product,
  Category,
  Order,
  User,
  CreateProductRequest,
  CreateCategoryRequest,
} from "../types";

const API_BASE_URL = "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthResponse>>("/auth/login", data),

  getProfile: () => api.get<ApiResponse<User>>("/auth/profile"),
};

export const productsApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: number;
  }) => api.get<ApiResponse<Product[]>>("/products", { params }),

  getById: (id: number) => api.get<ApiResponse<Product>>(`/products/${id}`),

  create: (data: CreateProductRequest | FormData) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.post<ApiResponse<Product>>("/products", data, config);
  },

  update: (id: number, data: Partial<CreateProductRequest> | FormData) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.put<ApiResponse<Product>>(`/products/${id}`, data, config);
  },

  delete: (id: number) => api.delete<ApiResponse<null>>(`/products/${id}`),
};

export const categoriesApi = {
  getAll: () => api.get<ApiResponse<Category[]>>("/categories"),

  getById: (id: number) => api.get<ApiResponse<Category>>(`/categories/${id}`),

  create: (data: CreateCategoryRequest | FormData) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.post<ApiResponse<Category>>("/categories", data, config);
  },

  update: (id: number, data: Partial<CreateCategoryRequest> | FormData) => {
    const config = data instanceof FormData ? {
      headers: { 'Content-Type': 'multipart/form-data' }
    } : {};
    return api.put<ApiResponse<Category>>(`/categories/${id}`, data, config);
  },

  delete: (id: number) => api.delete<ApiResponse<null>>(`/categories/${id}`),
};

export const ordersApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<Order[]>>("/orders/admin/all", { params }),

  getById: (id: number) => api.get<ApiResponse<Order>>(`/orders/${id}`),

  updateStatus: (id: number, data: { status: string; paymentRef?: string }) =>
    api.patch<ApiResponse<Order>>(`/orders/admin/${id}/status`, data),
};

export const usersApi = {
  getAll: () => api.get<ApiResponse<User[]>>("/users"),
};

export const dashboardApi = {
  getStats: () => api.get<ApiResponse<{
    totalProducts: number;
    totalOrders: number;
    totalCategories: number;
    totalUsers: number;
    totalRevenue: number;
    recentOrders: Order[];
  }>>("/dashboard/stats"),
};
