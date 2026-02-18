type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type BasicAuth = {
  username: string;
  password: string;
};

const toBasicAuthHeader = (auth: BasicAuth): string => {
  const token = btoa(`${auth.username}:${auth.password}`);
  return `Basic ${token}`;
};

const request = async <T>(path: string, method: HttpMethod, body?: unknown, auth?: BasicAuth): Promise<T> => {
  const res = await fetch(path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(auth ? { Authorization: toBasicAuthHeader(auth) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  const text = await res.text().catch(() => '');
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
};

export type BackendMenuResponse = {
  id: string;
  updatedAt: string;
  currency: string;
  food: Array<{ id: string; name: string; description?: string | null; price?: number | null; tags?: string[]; isActive?: boolean }>;
  wines: Array<{ id: string; name: string; description?: string | null; category?: string | null; region?: string | null; glassPrice?: number | null; bottlePrice?: number | null; isActive?: boolean }>;
};

export type BackendAvailabilityResponse = {
  date: string;
  partySize: number;
  timezone: string;
  slots: Array<{ time: string; available: boolean; reason?: string | null }>;
};

export type BackendReservationOut = {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';
  date: string;
  time: string;
  partySize: number;
  customer: { name: string; phone?: string | null; email?: string | null };
  notes?: string | null;
  createdAt: string;
};

export type BackendEventPublicItem = {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  timezone?: string;
  description: string;
  category: string;
  imageUrl: string;
  locationName?: string | null;
  isPublished?: boolean;
};

export type BackendEventPublicListResponse = {
  items: Array<BackendEventPublicItem>;
  nextCursor?: string | null;
};

export type BackendEventAdminItem = {
  id: string;
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  timezone?: string;
  description: string;
  category: string;
  imageUrl: string;
  locationName?: string | null;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendEventAdminListResponse = {
  items: Array<BackendEventAdminItem>;
  nextCursor?: string | null;
};

export type BackendEventCreatePayload = {
  title: string;
  dateStart: string;
  dateEnd?: string | null;
  timezone?: string;
  description: string;
  category: string;
  imageUrl: string;
  locationName?: string | null;
  isPublished?: boolean;
};

export type BackendEventUpdatePayload = BackendEventCreatePayload;

const extractPublicEventList = (res: BackendEventPublicListResponse | Array<BackendEventPublicItem>): Array<BackendEventPublicItem> => {
  if (Array.isArray(res)) return res;
  return Array.isArray(res.items) ? res.items : [];
};

const extractAdminEventList = (res: BackendEventAdminListResponse | Array<BackendEventAdminItem>): Array<BackendEventAdminItem> => {
  if (Array.isArray(res)) return res;
  return Array.isArray(res.items) ? res.items : [];
};

export const backendApi = {
  getMenu: () => request<BackendMenuResponse>('/api/v1/menu', 'GET'),
  getEvents: () => request<BackendEventPublicListResponse>('/api/v1/events', 'GET').then(extractPublicEventList),
  getSchedule: (from_?: string, to?: string) => {
    const qs = new URLSearchParams();
    if (from_) qs.set('from_', from_);
    if (to) qs.set('to', to);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<any>(`/api/v1/schedule${suffix}`, 'GET');
  },
  getAvailability: (date: string, partySize: number) => request<BackendAvailabilityResponse>(`/api/v1/availability?date=${encodeURIComponent(date)}&partySize=${encodeURIComponent(String(partySize))}`, 'GET'),
  createReservation: (payload: { date: string; time: string; partySize: number; customer: { name: string; phone?: string; email?: string }; notes?: string }) =>
    request<BackendReservationOut>('/api/v1/reservations', 'POST', payload),
  cancelReservation: (id: string, reason?: string) => request<BackendReservationOut>(`/api/v1/reservations/${encodeURIComponent(id)}/cancel`, 'POST', { reason: reason ?? null }),
  contactProjects: (payload: { name: string; email: string; phone?: string; company?: string; subject: string; message: string; consent?: boolean; source?: string }) =>
    request<{ id: string; status: 'RECEIVED' }>('/api/v1/contacts/projects', 'POST', payload),

  admin: {
    listConfig: (auth: BasicAuth) => request<{ items: Array<{ key: string; value: string }> }>('/admin/config', 'GET', undefined, auth),
    setConfig: (auth: BasicAuth, key: string, value: string) => request<{ key: string; value: string }>(`/admin/config/${encodeURIComponent(key)}`, 'PUT', { key, value }, auth),
    deleteMenuItem: (auth: BasicAuth, itemId: string) => request<void>(`/admin/menu/${encodeURIComponent(itemId)}`, 'DELETE', undefined, auth),
    listEvents: (auth: BasicAuth) => request<BackendEventAdminListResponse>('/admin/events', 'GET', undefined, auth).then(extractAdminEventList),
    createEvent: (auth: BasicAuth, payload: BackendEventCreatePayload) => request<{ id: string }>('/admin/events', 'POST', payload, auth),
    updateEvent: (auth: BasicAuth, id: string, payload: BackendEventUpdatePayload) =>
      request<void>(`/admin/events/${encodeURIComponent(id)}`, 'PUT', payload, auth),
    deleteEvent: (auth: BasicAuth, id: string) => request<void>(`/admin/events/${encodeURIComponent(id)}`, 'DELETE', undefined, auth),
    publishEvent: (auth: BasicAuth, id: string) => request<void>(`/admin/events/${encodeURIComponent(id)}/publish`, 'POST', undefined, auth),
    unpublishEvent: (auth: BasicAuth, id: string) => request<void>(`/admin/events/${encodeURIComponent(id)}/unpublish`, 'POST', undefined, auth),
    createFood: (auth: BasicAuth, payload: { name: string; description?: string; price?: number }) => {
      const qs = new URLSearchParams();
      qs.set('name', payload.name);
      if (payload.description) qs.set('description', payload.description);
      if (payload.price !== undefined) qs.set('price', String(payload.price));
      return request<{ id: string }>(`/admin/menu/food?${qs.toString()}`, 'POST', undefined, auth);
    },
    createWine: (
      auth: BasicAuth,
      payload: { name: string; description?: string; category?: string; region?: string; glassPrice?: number; bottlePrice?: number }
    ) => {
      const qs = new URLSearchParams();
      qs.set('name', payload.name);
      if (payload.description) qs.set('description', payload.description);
      if (payload.category) qs.set('category', payload.category);
      if (payload.region) qs.set('region', payload.region);
      if (payload.glassPrice !== undefined) qs.set('glassPrice', String(payload.glassPrice));
      if (payload.bottlePrice !== undefined) qs.set('bottlePrice', String(payload.bottlePrice));
      return request<{ id: string }>(`/admin/menu/wines?${qs.toString()}`, 'POST', undefined, auth);
    },
    upsertScheduleDay: (auth: BasicAuth, payload: { date: string; open?: boolean; note?: string }) => {
      const qs = new URLSearchParams();
      qs.set('date', payload.date);
      if (payload.open !== undefined) qs.set('open', String(payload.open));
      if (payload.note) qs.set('note', payload.note);
      return request<any>(`/admin/schedule/day?${qs.toString()}`, 'POST', undefined, auth);
    },
    addServiceWindow: (auth: BasicAuth, payload: { date: string; start: string; end: string }) => {
      const qs = new URLSearchParams();
      qs.set('date', payload.date);
      qs.set('start', payload.start);
      qs.set('end', payload.end);
      return request<any>(`/admin/schedule/window?${qs.toString()}`, 'POST', undefined, auth);
    },
  },
};
