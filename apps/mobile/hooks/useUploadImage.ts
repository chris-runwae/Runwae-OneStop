import * as ImagePicker from 'expo-image-picker';
import { useMutation } from 'convex/react';

import { api } from '@runwae/convex/convex/_generated/api';
import { uploadImageFromUri } from '@/lib/uploadImage';

/**
 * Pick an image from the device gallery and upload it to Convex
 * storage. Returns the resolved public URL or null if the picker was
 * cancelled. The `bucket` argument is kept for callsite compatibility
 * with the previous Supabase implementation; Convex storage is bucket-
 * less, so the value is currently unused.
 */
export const useUploadImage = () => {
  const generateUrl = useMutation(api.users.generateImageUploadUrl);
  const resolveUrl = useMutation(api.users.resolveStorageUrl);

  const pickAndUpload = async (_bucket?: string): Promise<string | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access gallery was denied');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return null;

    return await uploadImageFromUri(result.assets[0].uri, {
      generateUrl: () => generateUrl(),
      resolveUrl: (args) => resolveUrl(args),
    });
  };

  return { pickAndUpload };
};
