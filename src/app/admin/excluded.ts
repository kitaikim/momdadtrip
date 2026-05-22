const KEY = 'admin_excluded_device_ids';

export function getExcluded(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addExcluded(id: string): string[] {
  const list = getExcluded();
  if (!list.includes(id)) list.push(id);
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export function removeExcluded(id: string): string[] {
  const list = getExcluded().filter((x) => x !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export function getMyDeviceId(): string | null {
  try {
    return localStorage.getItem('momdadtrip_device_id');
  } catch {
    return null;
  }
}
