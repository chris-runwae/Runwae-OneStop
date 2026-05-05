import LocationMap from '@/components/event/LocationMap';
import { BlurView } from 'expo-blur';
import { MapPin, Navigation, X } from 'lucide-react-native';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';

interface FullScreenMapModalProps {
  visible: boolean;
  onClose: () => void;
  onDirections: () => void;
  location: string;
  title: string;
  latitude?: number;
  longitude?: number;
}

const FullScreenMapModal = ({
  visible,
  onClose,
  onDirections,
  location,
  title,
  latitude,
  longitude,
}: FullScreenMapModalProps) => {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <View className="flex-1 bg-white dark:bg-black">
        <LocationMap
          location={location}
          eventTitle={title}
          latitude={latitude}
          longitude={longitude}
          style={{ flex: 1 }}
        />

        {/* Close button */}
        <View
          style={{ paddingTop: insets.top || 20 }}
          className="absolute left-0 right-0 top-0 px-5">
          <TouchableOpacity
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm dark:bg-black/80">
            <X size={18} color={dark ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>

        {/* Bottom info card */}
        <BlurView
          intensity={80}
          tint={dark ? 'dark' : 'light'}
          className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-3xl"
          style={{ paddingBottom: insets.bottom || 24 }}>
          <View className="px-6 pb-2 pt-5">
            <View className="mb-1 h-1 w-12 self-center rounded-full bg-gray-300 dark:bg-white/20" />
            <Text
              className="mt-4 text-xl font-bold dark:text-white"
              style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}
              numberOfLines={1}>
              {title}
            </Text>
            <View className="mt-2 flex-row items-center gap-x-2">
              <MapPin size={13} color="#FF2E92" />
              <Text className="flex-1 text-sm text-gray-500 dark:text-gray-400">
                {location}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onDirections}
              className="mt-4 flex-row items-center justify-center gap-x-2 rounded-2xl bg-primary py-4">
              <Navigation size={16} color="#fff" />
              <Text
                className="text-base font-bold text-white"
                style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                Get Directions
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default FullScreenMapModal;
