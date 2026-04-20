import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import CustomSwitch from '@/components/ui/CustomSwitch';
import MainTabHeader from '@/components/ui/MainTabHeader';
import SkeletonBox from '@/components/ui/SkeletonBox';
import { MENU_OPTIONS, MOCK_REWARDS } from '@/constants/profile.constant';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import { ExternalPathString, RelativePathString, router } from 'expo-router';
import {
  Check,
  ChevronRight,
  Files,
  LogOut,
  SquarePen,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  TouchableOpacity,
  View,
  Text,
  useColorScheme,
} from 'react-native';
import { Text as RNText } from '@/components';
import { Colors, textStyles } from '@/constants';

const ProfileScreen = () => {
  const { user, isLoading, signOut } = useAuth();
  const [copied, setCopied] = useState(false);
  const [hostMode, setHostMode] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const { dark } = useTheme();
  const VERSION = Constants.expoConfig?.version || '1.0.0';
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <AppSafeAreaView>
      <MainTabHeader title="Profile" />

      <View className="mt-5 px-[20px]">
        <View className="flex flex-row items-center justify-between">
          <View className="flex-row items-center gap-x-3">
            {isLoading ? (
              <>
                <SkeletonBox width={60} height={60} borderRadius={30} />
                <View style={{ gap: 8 }}>
                  <SkeletonBox width={128} height={24} />
                  <SkeletonBox width={96} height={16} />
                </View>
              </>
            ) : (
              <>
                <TouchableOpacity
                  activeOpacity={user?.avatar_url ? 0.9 : 1}
                  onPress={() => user?.avatar_url && setShowImagePreview(true)}
                  className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full bg-primary">
                  {user?.avatar_url ? (
                    <Image
                      source={{ uri: user.avatar_url }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-xl font-bold text-white">
                      {(user?.full_name || 'John Doe')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)}
                    </Text>
                  )}
                </TouchableOpacity>
                <View>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    className="max-w-[200px] text-xl font-semibold text-black dark:text-white"
                    style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                    {user?.full_name}
                  </Text>
                  <View className="flex-row items-center gap-x-1">
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      className="max-w-[150px] text-sm font-light text-gray-400">
                      {user?.email}
                    </Text>
                    <TouchableOpacity
                      onPress={async () => {
                        const emailAddress = user?.email || '...';
                        await Clipboard.setStringAsync(emailAddress);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}>
                      {copied ? (
                        <Check size={13} color={'#10b981'} strokeWidth={1.5} />
                      ) : (
                        <Files size={13} color={'#9ca3af'} strokeWidth={1.5} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity onPress={() => router.push('/profile/edit')}>
            <SquarePen
              size={20}
              strokeWidth={1.5}
              color={dark ? '#ffffff' : '#000000'}
            />
          </TouchableOpacity>
        </View>

        {/* <View className="mt-5">
          <View className="flex-row items-center gap-x-2">
            <Text className="text-base font-semibold uppercase text-black dark:text-white">
              Rewards
            </Text>
            <View className="h-full rounded-[4px] bg-primary/10 px-[6px] py-[4px]">
              <Text className="text-sm font-semibold text-primary">
                Coming soon
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center gap-x-3">
            {MOCK_REWARDS.map((data, index) => (
              <View
                key={index}
                className="h-[62px] flex-1 items-start justify-center rounded-[6px] border border-gray-200 p-[10px] dark:border-dark-seconndary">
                <Text className="text-xl font-bold text-black dark:text-white">
                  {data.value}
                </Text>
                <Text className="text-sm font-light text-gray-400">
                  {data.label}
                </Text>
              </View>
            ))}
          </View>
        </View> */}

        {/* <View className="mt-5">
          <View className="rouded-[8px] flex-row items-center justify-between rounded-[10px] border-[0.5px] border-gray-200 bg-[#F8F9FA] px-[16px] py-[14px] dark:border-dark-seconndary dark:bg-dark-seconndary/50">
            <Text className="text-base font-semibold text-black dark:text-white">
              Switch to Host Mode
            </Text>
            <CustomSwitch
              value={hostMode}
              onValueChange={setHostMode}
              inactiveColor="#ADB5BD"
            />
          </View>
        </View> */}

        <View className="mt-5">
          <View className="flex-col gap-y-6">
            {MENU_OPTIONS.map((data, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  router.push(
                    data.route as RelativePathString | ExternalPathString
                  )
                }
                className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-x-4">
                  <View className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gray-200 dark:bg-dark-seconndary">
                    <data.icon
                      size={17}
                      strokeWidth={1.5}
                      color={dark ? '#ffffff' : '#343A40'}
                    />
                  </View>
                  <Text className="text-base font-semibold text-black dark:text-white">
                    {data.title}
                  </Text>
                </View>
                <ChevronRight
                  size={17}
                  strokeWidth={1.5}
                  color={dark ? '#ffffff' : '#000000'}
                />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => signOut()}
              className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-x-4">
                <View className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#F61801]">
                  <LogOut size={17} strokeWidth={1.5} color={'#ffffff'} />
                </View>
                <Text className="text-base font-semibold text-[#F61801]">
                  Log out
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <RNText
          style={{
            ...textStyles.regular_12,
            color: colors.textColors.subtle,
            width: '100%',
            textAlign: 'center',
            marginTop: 32,
          }}>
          Version {VERSION}
        </RNText>
      </View>

      {/* Full Screen Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}>
        <BlurView intensity={80} tint="dark" className="flex-1">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowImagePreview(false)}
            className="relative flex-1 items-center justify-center">
            <TouchableOpacity
              onPress={() => setShowImagePreview(false)}
              className="absolute right-6 top-14 z-10 p-2">
              <X color="white" size={28} strokeWidth={2} />
            </TouchableOpacity>

            {user?.avatar_url && (
              <Image
                source={{ uri: user.avatar_url }}
                className="h-full w-full"
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </BlurView>
      </Modal>
    </AppSafeAreaView>
  );
};

export default ProfileScreen;
