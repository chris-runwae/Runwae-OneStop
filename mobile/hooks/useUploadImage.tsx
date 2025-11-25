import { useUser, useAuth } from '@clerk/clerk-expo'; // or your auth hook
import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import { getSupabaseClient } from '@/lib/supabase';
import * as Crypto from 'expo-crypto';
import { useCallback, useState } from 'react';

export const useUploadImage = () => {
  const { user } = useUser(); // or your auth hook
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAndUpload = useCallback(
    async (folder: string) => {
      if (!user) throw new Error('User not logged in');

      const supabase = await getSupabaseClient(getToken);

      try {
        setLoading(true);
        setError(null);

        // Pick image
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [2, 1],
          quality: 0.8,
        });

        if (result.canceled) return null;

        const selectedImage = result.assets[0];

        // 1. Read file as base64 (string literal)
        const base64 = await readAsStringAsync(selectedImage.uri, {
          encoding: 'base64',
        });

        // 2. Convert to Buffer
        const buffer = Buffer.from(base64, 'base64');

        // 3. Generate unique filename
        const ext = selectedImage.uri.split('.').pop() || 'jpg';
        const filename = `${Crypto.randomUUID()}.${ext}`;
        const path = `${folder}/${user.id}/${filename}`;

        // 4. Upload
        const { error } = await supabase.storage
          .from('trip-images')
          .upload(path, buffer, {
            contentType: `image/${ext}`,
            // upsert: true, was causing issues
          });

        if (error !== null) {
          console.error('Error uploading image:', error);
          throw error;
        }

        // 5. Get public URL
        const { data } = supabase.storage.from(folder).getPublicUrl(path);
        return data.publicUrl;
      } catch (err: any) {
        console.error('Error uploading image:', err);
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, getToken]
  );

  return { pickAndUpload, loading, error };
};
