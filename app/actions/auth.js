'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encryptSession } from '../lib/session';
import { supabase } from '../lib/supabase';

export async function login(formData) {
  const username = formData.get('username');
  const password = formData.get('password');
  const remember = formData.get('remember') === 'on';

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, password, display_name, avatar_url, bio')
    .eq('username', username)
    .single();

  if (profile && profile.password === password) {
    const cookieStore = await cookies();
    // Exclude password from the session payload
    const sessionPayload = { 
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      remember: remember,
      loginAt: Date.now() 
    };
    
    const sessionToken = await encryptSession(sessionPayload);
    
    const cookieOptions = { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    };

    if (remember) {
      cookieOptions.maxAge = 60 * 60 * 24 * 30; // 30 days
    }

    cookieStore.set('auth_session', sessionToken, cookieOptions);
    return { success: true };
  } else {
    return { error: 'Incorrect username or password.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_session');
  redirect('/login');
}
