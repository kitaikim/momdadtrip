import { type AgeGroup } from '@/types';

export interface ChildProfile {
  name: string;
  ageGroup: AgeGroup;
}

export function getChildProfile(): ChildProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('child_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveChildProfile(profile: ChildProfile): void {
  localStorage.setItem('child_profile', JSON.stringify(profile));
}

// 한국어 조사: 이름 마지막 글자 받침 여부
export function nameParticle(name: string, withConsonant: string, withoutConsonant: string): string {
  if (!name) return withConsonant;
  const code = name.charCodeAt(name.length - 1);
  if (code < 0xAC00 || code > 0xD7A3) return withConsonant;
  return (code - 0xAC00) % 28 === 0 ? withoutConsonant : withConsonant;
}
