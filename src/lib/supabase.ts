// Supabase REST API 직접 호출 헬퍼 (SDK 없이 fetch 사용)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

export const db = {
  async select(table: string, filters: Record<string, string>, options?: { order?: string; limit?: number }) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => params.set(`${k}`, `eq.${v}`));
    if (options?.order) params.set('order', options.order);
    if (options?.limit) params.set('limit', String(options.limit));
    params.set('select', '*');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, { headers });
    if (!res.ok) return { data: [], error: await res.text() };
    return { data: await res.json(), error: null };
  },

  async upsert(table: string, record: Record<string, unknown>) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify(record),
    });
    if (!res.ok) return { error: await res.text() };
    return { error: null };
  },

  async delete(table: string, filters: Record<string, string>) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => params.set(k, `eq.${v}`));
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) return { error: await res.text() };
    return { error: null };
  },
};

// 기존 supabase 참조 호환성 (journal, stamp, mission 페이지용)
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});
