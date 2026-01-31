import { tabs } from '@/constants';
import { usePathname, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme.web';

interface TabItemProps {
  tab: (typeof tabs)[0];
  index: number;
  isSelected: boolean;
  onPress: (route: string, isSelected: boolean, index: number) => void;
}

const TabItem = ({ tab, index, isSelected, onPress }: TabItemProps) => {
  const Icon = tab.icon;
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      className={`z-10 h-[50px] flex-1 items-center justify-center gap-y-1 rounded-full ${isSelected ? (colorScheme === 'dark' ? 'border-[1px] border-[#71003B] bg-[#420021]' : 'bg-[#FFF0F4]') : 'bg-transparent'}`}
      activeOpacity={0.7}
      onPress={() => onPress(tab.route, isSelected, index)}>
      <Icon
        size={15}
        strokeWidth={1.5}
        color={isSelected ? '#FF2E92' : '#ADB5BD'}
      />
      <Text
        className={`text-[10px] font-medium ${isSelected ? 'text-[#FF2E92]' : 'text-[#ADB5BD]'}`}>
        {tab.title}
      </Text>
    </TouchableOpacity>
  );
};

const FloatingTabBar = () => {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();

  const isTabActive = useCallback(
    (tab: (typeof tabs)[0]) => {
      if (tab.name === 'index') {
        return (
          pathname === '/' || pathname === '/(tabs)' || pathname === '/(tabs)/'
        );
      }
      return pathname === tab.route || pathname.includes(`/${tab.name}`);
    },
    [pathname]
  );

  const handlePress = (route: string, isSelected: boolean, index: number) => {
    if (Platform.OS === 'ios' && !isSelected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.push(route as any);
  };

  const colorScheme = useColorScheme();

  return (
    <View
      style={{
        paddingBottom: Math.max(
          insets.bottom,
          Platform.select({ ios: 10, android: 10, default: 10 })
        ),
      }}
      className="absolute bottom-0 left-0 right-0 mx-auto flex flex-row items-center justify-center py-[20px]">
      <View className="flex w-[378px] flex-row items-center gap-x-3">
        <View
          className={`h-[60px] w-[306px] flex-1 flex-row items-center overflow-hidden rounded-full ${colorScheme === 'dark' ? 'border-[2px] border-[#8A94A621] bg-[#000000]' : 'bg-white'} px-[3px]`}>
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
        </View>
        <TouchableOpacity className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#FF2E92]">
          <Plus size={20} color={'#ffffff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FloatingTabBar;
