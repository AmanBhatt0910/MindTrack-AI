import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  withCredentials: true,
});

/**
 * REQUEST INTERCEPTOR
 * - Attach token (if present)
 * - Debug logs (dev only)
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * - Normalize errors
 * - Better debugging
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const data = error?.response?.data;
    // Extract error message – backend may use "error" or "message"
    let message =
      data?.error ||
      data?.message ||
      error?.message ||
      "Something went wrong";
      
    if (data?.details) {
      message += ` (${data.details})`;
    }

    return Promise.reject(new Error(message));
  }
);