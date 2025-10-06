export interface User {
  id: number;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface Product {
  id: number;
  title: string;
  description?: string;
  price: string;
  image?: string;
  sku?: string;
  stock: number;
  categoryId: number;
  category: Category;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: string;
  product: {
    id: number;
    title: string;
    image?: string;
  };
}

export interface Order {
  id: number;
  userId: number;
  user?: {
    id: number;
    email: string;
  };
  total: string;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";
  paymentRef?: string;
  razorpayOrderId?: string;
  items: OrderItem[];
  address?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface CreateProductRequest {
  title: string;
  description?: string;
  price: number;
  image?: string;
  sku?: string;
  stock: number;
  categoryId: number;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
}
