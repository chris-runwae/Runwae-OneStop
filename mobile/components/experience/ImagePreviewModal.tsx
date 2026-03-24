import { X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

interface ImagePreviewModalProps {
  images: string[];
  visible: boolean;
  initialIndex: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const THUMB_SIZE = 60;

const ImagePreviewModal = ({
  images,
  visible,
  initialIndex,
  onClose,
}: ImagePreviewModalProps) => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const thumbListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  const scrollToImage = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  }, []);

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        thumbListRef.current?.scrollToIndex({
          index: newIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }
    },
    [currentIndex]
  );

  const renderItem = useCallback(({ item }: { item: string }) => {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item }}
          style={styles.fullImage}
          contentFit="contain"
          transition={200}
        />
      </View>
    );
  }, []);

  const renderThumb = useCallback(
    ({ item, index }: { item: string; index: number }) => {
      const isActive = index === currentIndex;
      return (
        <TouchableOpacity
          onPress={() => scrollToImage(index)}
          style={[styles.thumbContainer, isActive && styles.activeThumb]}
        >
          <Image
            source={{ uri: item }}
            style={styles.thumbImage}
            contentFit="cover"
          />
        </TouchableOpacity>
      );
    },
    [currentIndex, scrollToImage]
  );

  const onLayout = useCallback(() => {
    if (initialIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
      });
      thumbListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }
  }, [initialIndex]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full bg-black/50"
          >
            <X color="white" size={24} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatListRef}
          data={images}
          renderItem={renderItem}
          keyExtractor={(item, index) => `full-${item}-${index}`}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onLayout={onLayout}
          onMomentumScrollEnd={onMomentumScrollEnd}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
        />

        {/* Footer: Pagination & Thumbnails */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <View className="items-center mb-4">
            <View className="px-4 py-1 rounded-full bg-black/50">
              <Text className="text-white text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </Text>
            </View>
          </View>

          <FlatList
            ref={thumbListRef}
            data={images}
            renderItem={renderThumb}
            keyExtractor={(item, index) => `thumb-${item}-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbListContent}
            getItemLayout={(_, index) => ({
              length: THUMB_SIZE + 10,
              offset: (THUMB_SIZE + 10) * index,
              index,
            })}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  thumbListContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  thumbContainer: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumb: {
    borderColor: "#FF2E92",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
});

export default ImagePreviewModal;
