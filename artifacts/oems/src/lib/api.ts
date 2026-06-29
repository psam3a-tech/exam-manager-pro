import { customFetch } from "@workspace/api-client-react";

const BASE = "/api";

export const api = {
  get: <T = unknown>(path: string): Promise<T> =>
    customFetch<T>(`${BASE}${path}`),
  post: <T = unknown>(path: string, data?: unknown): Promise<T> =>
    customFetch<T>(`${BASE}${path}`, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
  put: <T = unknown>(path: string, data?: unknown): Promise<T> =>
    customFetch<T>(`${BASE}${path}`, { method: "PUT", body: data !== undefined ? JSON.stringify(data) : undefined }),
  del: (path: string): Promise<void> =>
    customFetch<void>(`${BASE}${path}`, { method: "DELETE" }),
};
