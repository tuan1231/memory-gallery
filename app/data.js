import fs from 'fs/promises';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'stories.json');

// Ensure directories exist
async function init() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
    await fs.mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true });
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
