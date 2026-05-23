import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

export type { User };

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

export const auth = {
  signUp: (email: string, password: string) =>
    client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: 'https://momdadtrip.vercel.app/account' },
    }),

  signIn: (email: string, password: string) =>
    client.auth.signInWithPassword({ email, password }),

  signOut: () => client.auth.signOut(),

  getSession: () => client.auth.getSession(),

  onAuthStateChange: client.auth.onAuthStateChange.bind(client.auth),
};
