import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import 'react-native-get-random-values';
import * as Crypto from 'expo-crypto';

import { Buffer } from 'buffer';

export async function uploadImage(uri: string, folder = 'uploads') {
  const uuidv4 = () => Crypto.randomUUID();
  try {
    // Read file as Base64
    const fileBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Convert to binary
    const fileBuffer = Buffer.from(fileBase64, 'base64');

    // Generate a filename
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('trip-images')
      .upload(filePath, fileBuffer, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) throw error;

    // Return public URL
    const { data: urlData } = supabase.storage
      .from('trip-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Image upload failed:', err);
    throw err;
  }
}
