"use server";

import { supabase } from './lib/supabase';
import crypto from 'crypto';
import path from 'path';

export async function createStory(formData) {
  const title = formData.get('title');
  const content = formData.get('content');
  const image = formData.get('image');
  const password = formData.get('password');

  // Basic password protection (you can change this password)
  if (password !== 'iloveyou') {
    throw new Error('Incorrect password!');
  }

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

  const { error: insertError } = await supabase
    .from('stories')
    .insert({
      id: storyId,
      title,
      content,
      image_url: imageUrl,
    });

  if (insertError) {
    console.error('Insert error:', insertError);
    throw new Error('Failed to save memory.');
  }

  return storyId;
}

export async function archiveStory(id, password) {
  if (password !== 'iloveyou') {
    throw new Error('Incorrect password!');
  }

  const { error } = await supabase
    .from('stories')
    .update({ is_archived: true, archived_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error archiving story:', error);
    throw new Error('Failed to archive memory.');
  }
}

export async function restoreStory(id, password) {
  if (password !== 'iloveyou') {
    throw new Error('Incorrect password!');
  }

  const { error } = await supabase
    .from('stories')
    .update({ is_archived: false, archived_at: null })
    .eq('id', id);

  if (error) {
    console.error('Error restoring story:', error);
    throw new Error('Failed to restore memory.');
  }
}

export async function deleteStoryPermanently(id, password) {
  if (password !== 'iloveyou') {
    throw new Error('Incorrect password!');
  }

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
  const { error: deleteError } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.error('Error deleting story:', deleteError);
    throw new Error('Failed to delete memory permanently.');
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
