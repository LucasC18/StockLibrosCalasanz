import { LibroResumen, LibroDetalle, Usuario, EventoHistorial, TipoEvento } from '@/types/book';

const API_URL = import.meta.env.VITE_API_URL;

export interface DashboardSummary {
  totalBooks: number;
  lowStockBooks: number;
  recentShipments: number;
  todayMovements: number;
}

export interface CreateBookPayload {
  codigo: string;
  titulo: string;
  autor: string;
  editorial: string;
  isbn: string;
  categoria: string;
  descripcion: string;
  stock_actual: number;
  stock_minimo?: number;
  ubicacion: string;
  ultima_provincia?: string;
  imagen_url?: string;
}

export interface MovementPayload {
  tipo_evento: TipoEvento;
  descripcion_evento: string;
  stock_cambio: number;
  provincia_destino?: string;
  observaciones?: string;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : 'Error en la API';

    throw new Error(message);
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: Usuario;
    }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  me: (token: string) => request<{ user: Usuario }>('/api/auth/me', { token }),

  getBooks: (token: string) =>
    request<{
      items: LibroResumen[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/api/books', { token }),

  getBookById: (id: string, token: string) =>
    request<{ item: LibroDetalle }>(`/api/books/${id}`, { token }),

  createBook: (payload: CreateBookPayload, token: string) =>
    request<{ item: LibroResumen }>('/api/books', {
      method: 'POST',
      body: payload,
      token,
    }),

  updateBook: (id: string, payload: Partial<CreateBookPayload>, token: string) =>
    request<{ item: LibroResumen }>(`/api/books/${id}`, {
      method: 'PUT',
      body: payload,
      token,
    }),

  deleteBook: (id: string, token: string) =>
    request<{ success: boolean; message: string }>(`/api/books/${id}`, {
      method: 'DELETE',
      token,
    }),

  addMovement: (id: string, payload: MovementPayload, token: string) =>
    request<{ item: EventoHistorial }>(`/api/books/${id}/movements`, {
      method: 'POST',
      body: payload,
      token,
    }),

  getSummary: (token: string) =>
    request<DashboardSummary>('/api/dashboard/summary', { token }),
};