import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Pressable,
  Image as RNImage,
} from 'react-native';
import { RelativePathString, useRouter } from 'expo-router';
import { useClerk, useUser } from '@clerk/clerk-expo';
import * as ImagePicker from 'expo-image-picker';
import {
  Building2,
  CameraIcon,
  LogOut,
  MessageCircleQuestionMarkIcon,
  ShieldIcon,
  UserIcon,
  Cog,
  Bell,
} from 'lucide-react-native';

import { MenuItem, ScreenContainer, Spacer, Text } from '@/components';
import { ImagePickerModal } from '@/components/ui/ImagePickerModal';
import { FullScreenImageModal } from '@/components/ui/FullScreenImageModal';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';
import { useIOSMenu, IOSMenuSheet } from '@/components/buttons/IOSMenuButton';

// NOTE:
// The previous implementation used `className` (Tailwind-style) which will
// break bundlers that expect plain React Native `style` objects. This file
// replaces className usage with StyleSheet-based styles so it bundles and
// runs correctly in a standard Expo / React Native environment.

export function ProfileScreen() {
  const { user } = useUser();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);

  const menu = useIOSMenu();

  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log('Signed out successfully');
      // Redirect to your desired page
      router.replace('/(auth)/sign-in' as RelativePathString);
    } catch (err) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  const handleCameraPress = () => {
    setShowImagePickerModal(true);
  };

  const openCamera = async () => {
    setShowImagePickerModal(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        // TODO: Upload image to storage and update user profile
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Failed to access camera. Please try again.');
    }
  };

  const openGallery = async () => {
    setShowImagePickerModal(false);
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
        // TODO: Upload image to storage and update user profile
      }
    } catch (error) {
      console.error('Error accessing media library:', error);
      alert('Failed to access media library. Please try again.');
    }
  };

  const dynamicStyle = StyleSheet.create({
    cameraButton: {
      backgroundColor: colors.primaryColors.default,
    },
    versionText: {
      ...textStyles.subtitle_Regular,
      color: colors.textColors.subtitle,
      textAlign: 'center',
    },
  });

  const options = [
    {
      label: 'Share Trip',
      onPress: () => console.log('Share pressed'),
      icon: <Building2 size={18} color={colors.textColors.default} />,
    },
    {
      label: 'Edit Trip',
      onPress: () => console.log('Edit pressed'),
      icon: <CameraIcon size={18} color={colors.textColors.default} />,
    },
    {
      label: 'Security',
      onPress: () => console.log('Delete pressed'),
      icon: <ShieldIcon size={18} color={colors.destructiveColors.default} />,
      destructive: true,
    },
  ];

  const MenuButton = () => {
    return (
      <Pressable
        // onPress={() => router.push('/(tabs)/profile/account/account-info')}
        onPress={menu.open}>
        <Bell size={20} strokeWidth={1.5} color={colors.textColors.default} />
      </Pressable>
    );
  };

  return (
    <ScreenContainer
      header={{ title: 'Profile', rightComponent: <MenuButton /> }}>
      <IOSMenuSheet
        visible={menu.visible}
        onClose={menu.close}
        options={options}
        // title="Trip Actions"
      />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarWrapper}>
            <TouchableOpacity
              onPress={() => setShowFullScreenImage(true)}
              activeOpacity={0.8}>
              <RNImage
                source={{ uri: selectedImageUri || user?.imageUrl }}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cameraButton, dynamicStyle.cameraButton]}
              onPress={handleCameraPress}
              activeOpacity={0.8}>
              <CameraIcon size={15} color="#fff" />
            </TouchableOpacity>
          </View>

          <Spacer size={14} vertical />

          {/* NAME AND HANDLE */}
          <Text style={styles.name}>{user?.fullName ?? 'Who are you?🫣'}</Text>
          <Text style={styles.handle}>
            {user?.username
              ? `@${user?.username}`
              : user?.primaryEmailAddress?.emailAddress}
          </Text>

          {/* <View style={styles.pointsRow}>
            <View style={styles.pointsBox}>
              <Text style={styles.pointsText}>0 Points</Text>
            </View>
            <View style={styles.pointsBox}>
              <Text style={styles.pointsText}>4 Badges</Text>
            </View>
          </View> */}
        </View>

        <Spacer size={32} vertical />

        {/* MENU LIST */}
        <View style={styles.menuList}>
          <MenuItem
            title="Account Information"
            subtitle="Your ID, but make it Runwae"
            onPress={() => router.push('/(tabs)/profile/account/account-info')}
            icon={<UserIcon size={20} color={colors.textColors.default} />}
          />
          <MenuItem
            title="Security"
            subtitle="Stay safe while you explore"
            icon={<ShieldIcon size={20} color={colors.textColors.default} />}
            onPress={() => router.push('/(tabs)/profile/security/security')}
          />
          <MenuItem
            title="Support"
            subtitle="Need help? We're right here"
            icon={
              <MessageCircleQuestionMarkIcon
                size={20}
                color={colors.textColors.default}
              />
            }
            onPress={() => router.push('/(tabs)/profile/support/support')}
          />
          <MenuItem
            title="About"
            subtitle="Meet the story behind Runwae"
            icon={<Building2 size={20} color={colors.textColors.default} />}
          />
          <MenuItem
            title="Log out"
            icon={<LogOut size={20} color={colors.destructiveColors.default} />}
            onPress={handleSignOut}
          />
        </View>

        {/* <Spacer size={24} vertical />
        <Text style={dynamicStyle.versionText}>Version 0.1.4</Text>
        <Spacer size={4} vertical />
        <Text style={dynamicStyle.versionText}>What&apos;s new?</Text>
        <Text style={dynamicStyle.versionText}>
          - Fixed room details bug, Fiyin you can now tap on the pink button (it
          will not do anything for now)
        </Text>
        <Text style={dynamicStyle.versionText}>
          - Added much more activity data, you can now see the activity details
          and book it, redirects to Viator website or app if available
        </Text>

        <Spacer size={160} vertical /> */}
      </ScrollView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={showImagePickerModal}
        onClose={() => setShowImagePickerModal(false)}
        onCameraPress={openCamera}
        onGalleryPress={openGallery}
        colors={colors}
      />

      {/* Full Screen Image Modal */}
      <FullScreenImageModal
        visible={showFullScreenImage}
        onClose={() => setShowFullScreenImage(false)}
        imageUri={selectedImageUri ?? user?.imageUrl ?? null}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    right: 1,
    bottom: 0,
    // backgroundColor: '#ff4d6d',
    width: 30,
    height: 30,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...textStyles.bold_20,
    fontSize: 16,
  },
  handle: {
    color: '#7b7b7b',
    marginTop: 4,
  },
  pointsRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 12,
  },
  pointsBox: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pointsText: {
    fontSize: 13,
    color: '#666',
  },
  menuList: {},
  menuItem: {
    paddingVertical: 18,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemText: {
    flex: 1,
    paddingRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  menuSubtitle: {
    color: '#8a8a8a',
    marginTop: 4,
    fontSize: 13,
  },
  logoutButton: {
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#fff5f6',
    alignItems: 'center',
  },
  logoutText: {
    color: '#d94a45',
    fontWeight: '600',
  },

  // Account Info
  accountContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 8,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  backButton: {
    padding: 6,
    marginRight: 12,
  },
  accountTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
});
