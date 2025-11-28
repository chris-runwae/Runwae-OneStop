import {
  Pressable,
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'lucide-react-native';
import { router } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Spacer } from '@/components';
import { Colors } from '@/constants/theme';

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

const CreateItineraryScreen = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.overlay}>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => router.dismiss()}
      />
      {/* Modal Content */}
      <View
        style={[
          styles.modalContainer,
          {
            // height: MODAL_HEIGHT,
            backgroundColor: colors.backgroundColors.default,
            paddingBottom: insets.bottom,
          },
        ]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.dismiss()} style={styles.backButton}>
            <ArrowLeftIcon size={24} color={colors.textColors.default} />
          </Pressable>
        </View>
        <Spacer size={16} vertical />
        <Text>create</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    // justifyContent: 'flex-end',
  },
  backdrop: {
    // ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
});

export default CreateItineraryScreen;
