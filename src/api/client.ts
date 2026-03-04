import { mockDelay } from '@/mock/delay';
import type { ApiError } from '@/types/models';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = localStorage.getItem('ws_token');

  // Simulate network delay
  await mockDelay(300 + Math.random() * 400);

  const { handleRequest } = await import('@/mock/handlers');

  try {
    return await handleRequest<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error) {
    const apiError = error as ApiError;
    // Re-throw as a structured error
    throw apiError;
  }
}
