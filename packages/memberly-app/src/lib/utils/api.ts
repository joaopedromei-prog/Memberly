export class ApiRequestError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data?.error;
    throw new ApiRequestError(
      error?.code ?? 'UNKNOWN_ERROR',
      error?.message ?? 'An unexpected error occurred',
      response.status,
      error?.details
    );
  }

  return data as T;
}
