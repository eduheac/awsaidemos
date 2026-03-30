import { fetchAuthSession } from 'aws-amplify/auth';
import { API_ENDPOINT } from '../config/aws-config';
import { Demo } from '../types/demo';

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString() || '';
    return {
      'Content-Type': 'application/json',
      Authorization: token,
    };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_ENDPOINT}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  listDemos: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ items: Demo[]; count: number; nextToken?: string }>(`/demos${qs}`);
  },

  getDemo: (demoId: string) => request<Demo>(`/demos/${demoId}`),

  createDemo: (data: Partial<Demo>) =>
    request<Demo>('/demos', { method: 'POST', body: JSON.stringify(data) }),

  updateDemo: (demoId: string, data: Partial<Demo>) =>
    request<Demo>(`/demos/${demoId}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteDemo: (demoId: string) =>
    request<{ message: string }>(`/demos/${demoId}`, { method: 'DELETE' }),

  getUploadUrl: (demoId: string, fileName: string, fileType: string) =>
    request<{ uploadUrl: string; fileUrl: string; key: string }>('/demos/upload', {
      method: 'POST',
      body: JSON.stringify({ demoId, fileName, fileType }),
    }),

  searchDemos: (filters: Record<string, unknown>) =>
    request<{ items: Demo[]; count: number }>('/demos/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),
};
