import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { RelativePathString, useRouter } from 'expo-router';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';
import {
  Building2,
  CameraIcon,
  LogOut,
  MessageCircleQuestionMarkIcon,
  ShieldIcon,
  UserIcon,
} from 'lucide-react-native';

import { MenuItem, ScreenContainer, Spacer, Text } from '@/components';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

// NOTE:
// The previous implementation used `className` (Tailwind-style) which will
// break bundlers that expect plain React Native `style` objects. This file
// replaces className usage with StyleSheet-based styles so it bundles and
// runs correctly in a standard Expo / React Native environment.

export default function ProfileScreen() {
  const { user } = useUser();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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

  return (
    <ScreenContainer header={{ title: 'Profile' }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />

            <TouchableOpacity
              style={[styles.cameraButton, dynamicStyle.cameraButton]}
              activeOpacity={0.8}>
              <CameraIcon size={22} color="#fff" />
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

        <Spacer size={24} vertical />
        <Text style={dynamicStyle.versionText}>Version 0.1.1</Text>
      </ScrollView>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    right: 1,
    bottom: 0,
    // backgroundColor: '#ff4d6d',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...textStyles.bold_20,
    fontSize: 18,
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
