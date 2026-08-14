'use server';

import { supabaseAdmin as supabase } from './supabase-admin';
import { cookies } from 'next/headers';
import { decryptSession } from './session';
import { revalidatePath } from 'next/cache';

async function requireAuth() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_session')?.value;
  if (!sessionToken) throw new Error('Unauthorized');
  
  const payload = await decryptSession(sessionToken);
  if (!payload || !payload.username) throw new Error('Unauthorized');
  
  return payload;
}

export async function getImportantDates() {
  try {
    const session = await requireAuth();
    
    // We fetch all dates for both users so they can see shared important dates
    const { data, error } = await supabase
      .from('important_dates')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching important dates:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    return [];
  }
}

export async function addImportantDate(formData) {
  try {
    const session = await requireAuth();
    
    const title = formData.get('title');
    const date = formData.get('date');
    const email_content = formData.get('email_content');
    const is_recurring = formData.get('is_recurring') === 'on';

    if (!title || !date || !email_content) {
      return { error: 'Please provide all required fields.' };
    }

    const { error } = await supabase
      .from('important_dates')
      .insert({
        user_id: session.id,
        title,
        date,
        email_content,
        is_recurring
      });

    if (error) {
      console.error('Error adding important date:', error);
      return { error: 'Failed to add important date.' };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (err) {
    console.error('Error in addImportantDate:', err);
    return { error: 'An unexpected error occurred.' };
  }
}

export async function deleteImportantDate(id) {
  try {
    const session = await requireAuth();
    
    const { error } = await supabase
      .from('important_dates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting important date:', error);
      return { error: 'Failed to delete important date.' };
    }

    revalidatePath('/profile');
    return { success: true };
  } catch (err) {
    console.error('Error in deleteImportantDate:', err);
    return { error: 'An unexpected error occurred.' };
  }
}
