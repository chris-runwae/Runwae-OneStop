import { View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import { CreateTripChooser } from '@/components/home/CreateTripChooser';
import { Colors } from '@/constants';

export default function CreateTabScreen() {
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const colors = Colors[dark ? 'dark' : 'light'];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 12,
          backgroundColor: colors.backgroundColors.default,
        }}>
        <CreateTripChooser title="New trip" showCloseButton={false} />
      </View>
    </>
  );
}
