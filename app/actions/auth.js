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

export async function changePassword(formData) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_session')?.value;
  if (!sessionToken) return { error: 'Unauthorized' };
  
  const session = await decryptSession(sessionToken);
  if (!session) return { error: 'Unauthorized' };

  const oldPassword = formData.get('oldPassword');
  const newPassword = formData.get('newPassword');

  if (!oldPassword || !newPassword) {
    return { error: 'Please provide all information.' };
  }

  // Get current password from DB
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('password')
    .eq('id', session.id)
    .single();

  if (error || !profile) {
    return { error: 'System error when loading user data.' };
  }

  if (profile.password !== oldPassword) {
    return { error: 'Incorrect current password.' };
  }

  // Update to new password
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ password: newPassword })
    .eq('id', session.id);

  if (updateError) {
    return { error: 'Error updating new password.' };
  }

  return { success: true };
}
