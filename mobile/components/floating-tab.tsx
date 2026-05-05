import { tabs } from '@/constants';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import {
  RelativePathString,
  usePathname,
  useRouter,
  useSegments,
} from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItemProps {
  tab: (typeof tabs)[0];
  index: number;
  isSelected: boolean;
  onPress: (route: string, isSelected: boolean, index: number) => void;
}

const FloatingTabBar = () => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const segments = useSegments();

  const isTabActive = useCallback(
    (tab: (typeof tabs)[0]) => {
      const s = segments as string[];

      // Explore
      if (tab.name === 'explore') {
        return s.includes('explore');
      }

      // Trips
      if (tab.name === 'trips') {
        return s.includes('(trips)');
      }

      // Profile
      if (tab.name === 'profile') {
        return s.includes('profile');
      }

      // Home (Active ONLY if no other tab group is present)
      if (tab.name === 'home') {
        const isOtherRootTab =
          s.includes('(trips)') ||
          s.includes('explore') ||
          s.includes('profile');
        return !isOtherRootTab && (pathname === '/' || pathname === '/home');
      }

      return pathname === tab.route || pathname.includes(`/${tab.name}`);
    },
    [pathname, segments]
  );

  const handlePress = (route: string, isSelected: boolean, index: number) => {
    if (Platform.OS === 'ios' && !isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.push(route as any);
  };

  const TabItem = ({ tab, index, isSelected, onPress }: TabItemProps) => {
    const Icon = tab.icon;

    return (
      <TouchableOpacity
        className={`z-10 h-[50px] flex-1 items-center justify-center gap-y-1 rounded-full ${isSelected ? 'border border-pink-800 bg-pink-100 dark:border-pink-900 dark:bg-pink-950' : 'bg-transparent'}`}
        activeOpacity={0.7}
        onPress={() => onPress(tab.route, isSelected, index)}>
        <Icon
          size={15}
          strokeWidth={1.5}
          color={isSelected ? '#FF2E92' : '#ADB5BD'}
        />
        <Text
          className={`text-[10px] font-medium ${isSelected ? 'text-pink-600 dark:text-pink-400' : 'text-gray-400 dark:text-gray-400'}`}>
          {tab.title}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleNewTripPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/create-trip/destination' as RelativePathString);
  }, [router]);

  const isInCreateTripFlow = (segments as string[]).includes('create-trip');

  return (
    <View className="absolute bottom-0 left-0 right-0 mx-auto flex flex-row items-center justify-center py-[20px]">
      <View
        className={`flex flex-row items-center gap-x-3 ${isInCreateTripFlow ? 'w-[375px]' : 'w-[378px]'}`}>
        <BlurView
          intensity={70}
          tint="default"
          className="h-[60px] w-[306px] flex-1 flex-row items-center overflow-hidden rounded-full border-[1.5px] border-gray-200 bg-white/70 px-[3px] dark:border-gray-700 dark:bg-black/70">
          {tabs.map((tab, index) => {
            const isSelected = isTabActive(tab);
            return (
              <TabItem
                key={tab.name}
                tab={tab}
                index={index}
                isSelected={isSelected}
                onPress={handlePress}
              />
            );
          })}
        </BlurView>
        {!isInCreateTripFlow && (
          <TouchableOpacity
            onPress={handleNewTripPress}
            className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-pink-600">
            <Plus size={20} color={'#ffffff'} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FloatingTabBar;
