import { supabase } from './lib/supabase';

export async function getStories() {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories:', error);
    return [];
  }

  return data || [];
}

export async function getStoryById(id) {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching story:', error);
    return null;
  }

  return data;
}
