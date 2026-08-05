import { supabase } from './supabase';

async function signImageUrls(stories) {
  if (!stories) return stories;
  
  const isArray = Array.isArray(stories);
  const items = isArray ? stories : [stories];
  
  // Extract all valid filenames
  const filenames = [];
  const filenameToItemMap = new Map();
  
  for (const item of items) {
    if (item.image_url) {
      const urlParts = item.image_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      if (filename) {
        filenames.push(filename);
        if (!filenameToItemMap.has(filename)) {
          filenameToItemMap.set(filename, []);
        }
        filenameToItemMap.get(filename).push(item);
      }
    }
  }
  
  if (filenames.length > 0) {
    try {
      const { data, error } = await supabase.storage
        .from('uploads')
        .createSignedUrls(filenames, 60 * 60 * 24); // 24 hours
        
      if (data) {
        for (const signedObj of data) {
          if (signedObj.signedUrl && filenameToItemMap.has(signedObj.path)) {
            const linkedItems = filenameToItemMap.get(signedObj.path);
            for (const item of linkedItems) {
              item.image_url = signedObj.signedUrl;
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to batch sign urls", e);
    }
  }
  
  return isArray ? items : items[0];
}

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

  const signedData = await signImageUrls(data);
  return signedData || [];
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

  const signedData = await signImageUrls(data);
  return signedData || [];
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

  const signedData = await signImageUrls(data);
  return signedData;
}

export async function getMapPlaces() {
  const { data, error } = await supabase
    .from('love_map_places')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching map places:', error);
    return [];
  }

  return data || [];
}

export async function getCommentsByStoryId(storyId) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('story_id', storyId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return data || [];
}
