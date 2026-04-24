import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase/client";
import { useAuth } from "./useAuth";

export const useUploadImage = () => {
  const { user } = useAuth();

  const pickAndUpload = async (bucket: string) => {
    try {
      // Request permissions if needed (though already handled in component, good to be safe)
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access gallery was denied");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const imageUri = result.assets[0].uri;
      const fileExtension = imageUri.split(".").pop() || "jpg";
      const fileName = `${user?.id || 'anonymous'}/${Date.now()}.${fileExtension}`;

      // Convert URI to Blob for Supabase upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, {
          contentType: `image/${fileExtension}`,
          upsert: true,
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in useUploadImage:", error);
      throw error;
    }
  };

  return { pickAndUpload };
};
