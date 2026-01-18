// lib/apiClient.ts
import { getAuthToken } from "@/lib/auth/client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://sti-5i2r.onrender.com";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  method?: RequestMethod;
  body?: any;
  headers?: Record<string, string>;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  
  const token = getAuthToken(); // Récupère le token stocké (localStorage/Cookie)

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  // Gestion des slashs pour éviter les doubles //
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  const response = await fetch(`${BASE_URL}${cleanEndpoint}`, config);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error ${response.status}: ${errorBody}`);
  }

  // Si la réponse est 204 No Content (souvent pour DELETE)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}