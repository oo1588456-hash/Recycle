"use client";

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/lib/auth/auth-store";
import { getBrowserApiBase } from "@/lib/api/base-url";

const baseURL = getBrowserApiBase();

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().access;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccess(): Promise<string | null> {
  const { refresh, setAccess, user, logout } = useAuthStore.getState();
  if (!refresh || !user) {
    logout();
    return null;
  }
  const res = await axios.post(`${baseURL}/auth/refresh/`, { refresh });
  const access = res.data?.access as string | undefined;
  if (!access) {
    logout();
    return null;
  }
  setAccess(access);
  return access;
}

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (original?.url?.includes("/auth/refresh/")) {
      return Promise.reject(error);
    }
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccess().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccess = await refreshPromise;
      if (newAccess && original.headers) {
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  }
);
