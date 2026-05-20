// Supabase REST API 직접 호출 헬퍼 (SDK 없이 fetch 사용)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const BASE_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

function fetchWithTimeout(url: string, options: RequestInit, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export const db = {
  async select(table: string, filters: Record<string, string>, options?: { order?: string; limit?: number }) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return { data: [], error: 'Supabase 환경변수 미설정' };
    const params = new URLSearchParams({ select: '*' });
    Object.entries(filters).forEach(([k, v]) => params.set(k, `eq.${v}`));
    if (options?.order) params.set('order', options.order);
    if (options?.limit) params.set('limit', String(options.limit));
    try {
      const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers: BASE_HEADERS });
      if (!res.ok) return { data: [], error: await res.text() };
      return { data: await res.json() as Record<string, unknown>[], error: null };
    } catch (e) {
      return { data: [], error: String(e) };
    }
  },

  async upsert(table: string, record: Record<string, unknown>) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return { error: 'Supabase 환경변수 미설정' };
    try {
      const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...BASE_HEADERS, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(record),
      });
      if (!res.ok) return { error: await res.text() };
      return { error: null };
    } catch (e) {
      return { error: String(e) };
    }
  },

  async delete(table: string, filters: Record<string, string>) {
    if (!SUPABASE_URL || !SUPABASE_KEY) return { error: 'Supabase 환경변수 미설정' };
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => params.set(k, `eq.${v}`));
    try {
      const res = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
        method: 'DELETE',
        headers: BASE_HEADERS,
      });
      if (!res.ok) return { error: await res.text() };
      return { error: null };
    } catch (e) {
      return { error: String(e) };
    }
  },
};

export const storage = {
  async upload(bucket: string, path: string, file: File): Promise<{ url: string | null; error: string | null }> {
    if (!SUPABASE_URL || !SUPABASE_KEY) return { url: null, error: 'Supabase 환경변수 미설정' };
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': file.type },
        body: file,
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));
      if (!res.ok) return { url: null, error: await res.text() };
      return { url: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`, error: null };
    } catch (e) {
      return { url: null, error: String(e) };
    }
  },
};
