"use server";

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const dataFile = path.join(process.cwd(), 'data', 'stories.json');
const uploadDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist
async function init() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    await fs.mkdir(uploadDir, { recursive: true });
    // create stories.json if not exists
    try {
      await fs.access(dataFile);
    } catch {
      await fs.writeFile(dataFile, '[]');
    }
  } catch (error) {
    console.error("Init error", error);
  }
}

export async function getStories() {
  await init();
  try {
    const fileContents = await fs.readFile(dataFile, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return [];
  }
}

export async function getStoryById(id) {
  const stories = await getStories();
  return stories.find(s => s.id === id) || null;
}

export async function createStory(formData) {
  await init();
  
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
    const filepath = path.join(uploadDir, filename);
    
    await fs.writeFile(filepath, buffer);
    imageUrl = `/uploads/${filename}`;
  }


  const newStory = {
    id: crypto.randomUUID(),
    title,
    content,
    imageUrl,
    date: new Date().toISOString()
  };

  const stories = await getStories();
  stories.unshift(newStory); // Add to beginning

  await fs.writeFile(dataFile, JSON.stringify(stories, null, 2));

  return newStory.id;
}
