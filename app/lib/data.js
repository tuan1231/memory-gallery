import { supabase } from './supabase';

export async function cleanupOldArchives() {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: oldStories } = await supabase
      .from('stories')
      .select('id, image_url')
      .eq('is_archived', true)
      .lt('archived_at', threeDaysAgo.toISOString());

    if (oldStories && oldStories.length > 0) {
      for (const story of oldStories) {
        if (story.image_url) {
          try {
            const urlParts = story.image_url.split('/');
            const filename = urlParts[urlParts.length - 1];
            if (filename) {
              await supabase.storage.from('uploads').remove([filename]);
            }
          } catch (e) {
            console.error('Failed to delete old image:', e);
          }
        }
      }

      const ids = oldStories.map(s => s.id);
      await supabase.from('stories').delete().in('id', ids);
    }
  } catch (error) {
    console.error('Error cleaning up archives:', error);
  }
}

export async function getStories() {
  await cleanupOldArchives();

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .or('is_archived.is.null,is_archived.eq.false')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching stories:', error);
    return [];
  }

  return data || [];
}

export async function getArchivedStories() {
  await cleanupOldArchives();

  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('is_archived', true)
    .order('archived_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived stories:', error);
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
