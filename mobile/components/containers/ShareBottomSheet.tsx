import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  // BottomSheetMethods,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Asset } from 'expo-asset';
import Share, { ShareOptions } from 'react-native-share';
import { Colors } from '@/constants';
import { Text, MenuItem } from '@/components';
import { textStyles } from '@/utils/styles';

type ShareBottomSheetProps = {
  // bottomSheetRef: React.RefObject<BottomSheetMethods | null>;
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  shareData?: {
    title?: string;
    message?: string;
    url?: string;
    imageUrl?: string;
  };
  onShare?: () => void;
  additionalOptions?: {
    title: string;
    onPress: () => void;
  }[];
};

export const ShareBottomSheet: React.FC<ShareBottomSheetProps> = ({
  bottomSheetRef,
  shareData,
  onShare,
  additionalOptions = [],
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }

    const title = shareData?.title || 'Check this out!';
    const message = shareData?.message || 'Check this out';
    const url = shareData?.url || '';
    const iconUri = shareData?.imageUrl || 'https://i.pravatar.cc/150?img=1';

    try {
      let icon: string | undefined;
      try {
        const iconSource = Image.resolveAssetSource(
          require('@/assets/images/icon.png')
        );
        icon = iconSource.uri;
        const asset = Asset.fromModule(require('@/assets/images/icon.png'));
        await asset.downloadAsync();
      } catch (assetError) {
        console.log('Icon asset not found, using default');
        icon = iconUri;
      }

      const options = Platform.select({
        ios: {
          activityItemSources: [
            {
              placeholderItem: {
                type: 'url',
                content: iconUri,
              },
              item: {
                default: {
                  type: 'text',
                  content: `${message} ${url}`,
                },
              },
              linkMetadata: {
                title,
                icon: icon || iconUri,
                image: iconUri,
              },
            },
          ],
        },
        default: {
          title,
          subject: title,
          message: `${message} ${url}`,
        },
      });

      await Share.open(options as ShareOptions);
      bottomSheetRef.current?.close();
    } catch (error) {
      console.log('Error sharing: ', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.subtle,
      height: '100%',
    },
    content: {
      padding: 20,
      gap: 16,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 18,
      color: colors.textColors.default,
    },
    shareButton: {
      padding: 14,
      backgroundColor: colors.backgroundColors.default,
      borderRadius: 10,
    },
    shareButtonText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.textColors.default,
    },
  });

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['50%']}
      detached={true}
      backgroundStyle={{
        backgroundColor: colors.backgroundColors.subtle,
      }}
      enablePanDownToClose>
      <BottomSheetView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Share</Text>

          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareButton}
            activeOpacity={0.7}>
            <Text style={styles.shareButtonText}>Share Link</Text>
          </TouchableOpacity>

          {additionalOptions.map((option, index) => (
            <MenuItem
              key={index}
              title={option.title}
              onPress={() => {
                option.onPress();
                bottomSheetRef.current?.close();
              }}
            />
          ))}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};
