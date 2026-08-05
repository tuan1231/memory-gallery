// lib/session.js
export const secretKey = process.env.SESSION_SECRET || 'memory-gallery-very-secure-secret-key-32-chars';

async function getCryptoKey() {
  const encoder = new TextEncoder();
  // Ensure the key is exactly 32 bytes for AES-GCM
  const keyBuffer = encoder.encode(secretKey).slice(0, 32);
  const paddedKey = new Uint8Array(32);
  paddedKey.set(keyBuffer);

  return await crypto.subtle.importKey(
    'raw',
    paddedKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptSession(payload) {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  
  const encryptedBytes = new Uint8Array(encrypted);
  const combined = new Uint8Array(iv.length + encryptedBytes.length);
  combined.set(iv);
  combined.set(encryptedBytes, iv.length);
  
  return bufferToBase64(combined.buffer);
}

export async function decryptSession(sessionString) {
  try {
    const key = await getCryptoKey();
    const combinedBuffer = base64ToBuffer(sessionString);
    const combined = new Uint8Array(combinedBuffer);
    
    const iv = combined.slice(0, 12);
    const encryptedData = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (e) {
    console.error('Session decryption failed:', e);
    return null;
  }
}
