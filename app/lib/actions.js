"use server";

import { supabase } from './supabase';
import crypto from 'crypto';
import path from 'path';
import { cookies } from 'next/headers';
import { decryptSession } from './session';

async function requireAuth() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_session')?.value;
  if (!sessionToken) throw new Error('Unauthorized');
  
  const payload = await decryptSession(sessionToken);
  if (!payload || !payload.username) throw new Error('Unauthorized');
  
  return payload.username;
}

export async function createStory(formData) {
  await requireAuth();

  const title = formData.get('title');
  const content = formData.get('content');
  const image = formData.get('image');

  if (!title || !content) {
    throw new Error('Please provide a title and a story!');
  }

  let imageUrl = '';

  if (image && image.size > 0) {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(image.name) || '.jpg';
    const filename = `${uniqueSuffix}${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filename, buffer, {
        contentType: image.type || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload image.');
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filename);

    imageUrl = publicUrlData.publicUrl;
  }

  const storyId = crypto.randomUUID();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_session')?.value;
  let session = null;
  if (sessionToken) {
    session = await decryptSession(sessionToken);
  }

  const payload = {
    id: storyId,
    title,
    content,
    image_url: imageUrl,
  };

  try {
    const { error: insertError } = await supabase
      .from('stories')
      .insert({ ...payload, author_id: session?.id });
      
    if (insertError) {
      if (insertError.message.includes('Could not find') || insertError.code === '42703') {
        throw new Error('Column not found fallback');
      }
      throw insertError;
    }
  } catch (err) {
    if (err.message === 'Column not found fallback' || err.message?.includes('Could not find') || err.code === '42703') {
      const { error: fallbackError } = await supabase
        .from('stories')
        .insert(payload);
      if (fallbackError) {
        console.error('Insert fallback error:', fallbackError);
        throw new Error('Failed to save memory.');
      }
    } else {
      console.error('Insert error:', err);
      throw new Error('Failed to save memory.');
    }
  }

  return storyId;
}

export async function archiveStory(id) {
  await requireAuth();

  const { data, error } = await supabase
    .from('stories')
    .update({ is_archived: true, archived_at: new Date().toISOString() })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error archiving story:', error);
    throw new Error('Failed to archive memory.');
  }

  if (!data || data.length === 0) {
    throw new Error('Archive failed! Please check Supabase: The "stories" table is blocked by RLS UPDATE policy. Please disable RLS or add a policy allowing UPDATE.');
  }
}

export async function restoreStory(id) {
  await requireAuth();

  const { data, error } = await supabase
    .from('stories')
    .update({ is_archived: false, archived_at: null })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error restoring story:', error);
    throw new Error('Failed to restore memory.');
  }

  if (!data || data.length === 0) {
    throw new Error('Restore failed! Blocked by RLS UPDATE policy on Supabase.');
  }
}

export async function deleteStoryPermanently(id) {
  await requireAuth();

  // First, get the story to find the image URL
  const { data: story, error: fetchError } = await supabase
    .from('stories')
    .select('image_url')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching story for deletion:', fetchError);
    throw new Error('Failed to fetch memory for deletion.');
  }

  // Delete from DB
  const { data, error: deleteError } = await supabase
    .from('stories')
    .delete()
    .eq('id', id)
    .select();

  if (deleteError) {
    console.error('Error deleting story:', deleteError);
    throw new Error('Failed to delete memory permanently.');
  }

  if (!data || data.length === 0) {
    throw new Error('Deletion failed! The "stories" table is blocked by RLS DELETE policy on Supabase. Please disable RLS or add a policy allowing DELETE.');
  }

  // Delete image from storage if it exists
  if (story && story.image_url) {
    try {
      const urlParts = story.image_url.split('/');
      const filename = urlParts[urlParts.length - 1];
      if (filename) {
        await supabase.storage.from('uploads').remove([filename]);
      }
    } catch (e) {
      console.error('Failed to delete image from storage:', e);
    }
  }
}

export async function addMapPlace(data) {
  await requireAuth();

  const { name, address, notes, lat, lng } = data;

  if (!name || !address || typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('Please provide all required fields!');
  }

  const { error } = await supabase
    .from('love_map_places')
    .insert({
      name,
      address,
      notes,
      lat,
      lng
    });

  if (error) {
    console.error('Insert error:', error);
    throw new Error('Failed to save map place.');
  }

  return true;
}

export async function deleteMapPlace(id) {
  await requireAuth();

  const { data, error } = await supabase
    .from('love_map_places')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error deleting place:', error);
    throw new Error('Failed to delete map place.');
  }

  if (!data || data.length === 0) {
    throw new Error('Deletion failed! The "love_map_places" table is blocked by RLS DELETE policy on Supabase.');
  }
  return true;
}

// Helper to create notifications with schema cache fallback
async function createNotification(payload) {
  let { error: notifErr } = await supabase.from('notifications').insert(payload);
  
  if (notifErr && (notifErr.code === '42703' || notifErr.code === 'PGRST204' || notifErr.message.includes('Could not find'))) {
    delete payload.comment_id;
    const { error: fallbackErr } = await supabase.from('notifications').insert(payload);
    if (fallbackErr) console.error('Notification fallback error:', fallbackErr);
  } else if (notifErr) {
    console.error('Failed to create notification:', notifErr);
  }
}

// Helper to process all comment notifications
async function processCommentNotifications(storyId, parentId, data, session, authorName, avatarUrl) {
  try {
    // Find who owns the story
    const { data: storyData } = await supabase.from('stories').select('author_id').eq('id', storyId).single();
    
    // Notify story owner
    if (storyData && storyData.author_id && storyData.author_id !== session.id) {
      await createNotification({
        user_id: storyData.author_id,
        actor_name: authorName,
        actor_avatar: avatarUrl,
        action_type: 'comment',
        story_id: storyId,
        comment_id: data?.id
      });
    }

    // Notify parent comment owner if it's a reply
    if (parentId) {
      const { data: parentComment } = await supabase.from('comments').select('author_name').eq('id', parentId).single();
      if (parentComment && parentComment.author_name) {
        // Try to match author_name to a profile
        const { data: parentProfile } = await supabase
          .from('profiles')
          .select('id')
          .or(`display_name.eq."${parentComment.author_name}",username.eq."${parentComment.author_name}"`)
          .single();
          
        if (
          parentProfile && 
          parentProfile.id && 
          parentProfile.id !== session.id && 
          parentProfile.id !== storyData?.author_id
        ) {
          await createNotification({
            user_id: parentProfile.id,
            actor_name: authorName,
            actor_avatar: avatarUrl,
            action_type: 'reply', // Using action_type 'reply'
            story_id: storyId,
            comment_id: data?.id
          });
        }
      }
    }
  } catch (err) {
    console.error('Notification process error:', err);
  }
}

export async function addComment(storyId, content, parentId = null) {
  if (!content) {
    throw new Error('Please enter your comment!');
  }
  
  // Enforce auth and get current user
  const username = await requireAuth();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_session')?.value;
  const session = await decryptSession(sessionToken);
  
  const authorName = session.display_name || session.username || username;
  const avatarUrl = session.avatar_url;

  const payload = {
    story_id: storyId,
    author_name: authorName,
    content,
    parent_id: parentId
  };

  try {
    // Try to insert with avatar_url if the column exists
    const { data, error } = await supabase
      .from('comments')
      .insert({ ...payload, avatar_url: avatarUrl })
      .select()
      .single();

    if (error) {
      // If it's a column not found error, fallback
      if (error.message.includes('Could not find') || error.code === '42703') {
        throw new Error('Column not found fallback');
      }
      throw error;
    }
    
    // Process notifications
    await processCommentNotifications(storyId, parentId, data, session, authorName, avatarUrl);
    
    return data;
  } catch (err) {
    // Fallback: insert without avatar_url
    if (err.message === 'Column not found fallback' || err.message?.includes('Could not find') || err.code === '42703') {
      const { data, error } = await supabase
        .from('comments')
        .insert(payload)
        .select()
        .single();
        
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      // Process notifications
      await processCommentNotifications(storyId, parentId, data, session, authorName, avatarUrl);
      
      return data;
    }
    
    console.error('Insert comment error:', err);
    throw new Error(`Database error: ${err.message || 'Unknown error'}`);
  }
}

export async function reactToComment(commentId, newEmoji, oldEmoji = null) {
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('reactions')
    .eq('id', commentId)
    .single();
    
  if (fetchError) throw new Error('Comment not found');
  
  const currentReactions = comment.reactions || {};
  
  // Remove old emoji if it exists
  if (oldEmoji && currentReactions[oldEmoji] > 0) {
    currentReactions[oldEmoji] -= 1;
    if (currentReactions[oldEmoji] === 0) {
      delete currentReactions[oldEmoji];
    }
  }
  
  // Add new emoji if it exists
  if (newEmoji) {
    currentReactions[newEmoji] = (currentReactions[newEmoji] || 0) + 1;
  }
  
  const { data, error } = await supabase
    .from('comments')
    .update({ reactions: currentReactions })
    .eq('id', commentId)
    .select()
    .single();
    
  if (error) {
    console.error('Update reaction error:', error);
    throw new Error('Failed to react');
  }
  
  return data;
}

export async function getNotifications() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_session')?.value;
  if (!sessionToken) return [];
  
  const session = await decryptSession(sessionToken);
  if (!session) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', session.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

export async function markNotificationsAsRead() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('auth_session')?.value;
  if (!sessionToken) return false;
  
  const session = await decryptSession(sessionToken);
  if (!session) return false;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', session.id)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking notifications as read:', error);
    return false;
  }

  return true;
}
