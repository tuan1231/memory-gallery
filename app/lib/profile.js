'use server';

import { supabase } from './supabase';
import { cookies } from 'next/headers';
import { decryptSession, encryptSession } from './session';
import { revalidatePath } from 'next/cache';

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_session')?.value;
  if (!sessionToken) return null;
  return await decryptSession(sessionToken);
}

export async function updateProfile(formData) {
  const session = await getSession();
  if (!session) {
    return { error: 'Not authenticated' };
  }

  const displayName = formData.get('display_name');
  const bio = formData.get('bio');
  const avatarFile = formData.get('avatar');
  
  let avatarUrl = session.avatar_url;

  try {
    // 1. Upload avatar if provided
    if (avatarFile && avatarFile.size > 0) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileExt = avatarFile.name.split('.').pop().toLowerCase();
      const fileName = `${session.id}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Upload avt')
        .upload(fileName, buffer, {
          contentType: avatarFile.type || 'image/jpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('Upload avt')
        .getPublicUrl(fileName);
        
      avatarUrl = publicUrlData.publicUrl;
    }

    // 2. Update profile in database
    const { data: profileData, error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio,
        ...(avatarUrl && { avatar_url: avatarUrl })
      })
      .eq('id', session.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Update session cookie
    const cookieStore = await cookies();
    const sessionPayload = {
      ...session,
      display_name: profileData.display_name,
      avatar_url: profileData.avatar_url,
    };
    const newSessionToken = await encryptSession(sessionPayload);
    
    const cookieOptions = { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    };

    if (session.remember) {
      cookieOptions.maxAge = 60 * 60 * 24 * 30; // 30 days
    }

    cookieStore.set('auth_session', newSessionToken, cookieOptions);

    revalidatePath('/profile');
    revalidatePath('/'); // to update navbar

    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return { error: 'Failed to update profile' };
  }
}

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, bio')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
  return data;
}
