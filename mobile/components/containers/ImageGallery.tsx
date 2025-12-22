import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants';
import { Text } from '@/components';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FlatList } from 'react-native';

type ImageType = {
  url?: string;
  urlHD?: string;
  defaultImage?: boolean;
  order?: number;
};

type ImageGalleryProps = {
  images: ImageType[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex = 0,
  visible,
  onClose,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const imageUrls = (images || [])
    .map((img) => img.urlHD || img.url)
    .filter(Boolean) as string[];

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
    },
    closeButton: {
      position: 'absolute',
      top: insets.top + 16,
      right: 16,
      zIndex: 1000,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    imageContainer: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
    indicatorContainer: {
      position: 'absolute',
      bottom: insets.bottom + 20,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 1000,
    },
    indicator: {
      flexDirection: 'row',
      gap: 8,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeDot: {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      width: 24,
    },
    counter: {
      color: 'white',
      fontSize: 14,
      marginTop: 8,
    },
  });

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.modal}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}>
          <X size={24} color="white" />
        </TouchableOpacity>

        <FlatList
          data={imageUrls}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item }) => (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
            </View>
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
        />

        {imageUrls.length > 1 && (
          <View style={styles.indicatorContainer}>
            <View style={styles.indicator}>
              {imageUrls.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
            <Text style={styles.counter}>
              {currentIndex + 1} / {imageUrls.length}
            </Text>
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
};
