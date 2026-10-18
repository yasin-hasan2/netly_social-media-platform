import axios from "axios";

// Always use same-origin relative API path in AI Studio fullstack app
export const axiosInstance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

// Automatically attach Bearer token to all outgoing requests
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore localStorage access restrictions if any
    }
    return config;
  },
  (error) => Promise.reject(error)
);
