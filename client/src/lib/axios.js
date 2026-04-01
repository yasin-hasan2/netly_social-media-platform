import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "https://netly-social-media-platform.onrender.com/api/v1"
    : "/api/V1";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
