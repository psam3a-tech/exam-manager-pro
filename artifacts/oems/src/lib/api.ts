import { customFetch } from "@workspace/api-client-react";

const BASE = "/api";

function handleError(err: unknown): never {
  if (typeof window !== "undefined" && (err as any)?.status === 401) {
    window.dispatchEvent(new CustomEvent("oems:unauthorized"));
  }
  throw err;
}

export const api = {
  get: <T = unknown>(path: string): Promise<T> =>
    customFetch<T>(`${BASE}${path}`).catch(handleError),
  post: <T = unknown>(path: string, data?: unknown): Promise<T> =>
    customFetch<T>(`${BASE}${path}`, {
      method: "POST",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }).catch(handleError),
  put: <T = unknown>(path: string, data?: unknown): Promise<T> =>
    customFetch<T>(`${BASE}${path}`, {
      method: "PUT",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }).catch(handleError),
  del: (path: string): Promise<void> =>
    customFetch<void>(`${BASE}${path}`, { method: "DELETE" }).catch(handleError),
};
