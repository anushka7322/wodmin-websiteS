import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "wodmin_admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => { if (t) localStorage.setItem(TOKEN_KEY, t); else localStorage.removeItem(TOKEN_KEY); };

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      const url = err.config?.url || "";
      if (url.includes("/admin/")) {
        setToken(null);
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/admin/login")) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export const formatINR = (n) => {
  if (n === null || n === undefined) return "";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
};
