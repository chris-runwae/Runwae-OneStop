import { StyleSheet, View, useColorScheme } from 'react-native';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants';

export default function HomeScreenSkeleton() {
  const colorMode = useColorScheme() ?? 'light';
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    shape: {
      justifyContent: 'center',
      height: 250,
      width: 250,
      borderRadius: 25,
      marginRight: 10,
      backgroundColor: 'white',
    },
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
      paddingTop: insets.top + 10,
      // justifyContent: 'center',
    },
    padded: {
      padding: 16,
    },
  });

  return (
    <MotiView
      transition={{
        type: 'timing',
      }}
      style={[styles.container, styles.padded]}
      animate={{
        backgroundColor: colors.backgroundColors.default,
      }}>
      <Skeleton colorMode={colorMode} radius="round" height={48} width={48} />
      <Spacer />
      <View style={{ alignItems: 'center' }}>
        <Skeleton colorMode={colorMode} width={'100%'} height={295} />
        <Spacer height={32} />
        <Skeleton colorMode={colorMode} width={'100%'} height={24} />
        <Spacer height={8} />
        <Skeleton colorMode={colorMode} width={'100%'} height={416} />
      </View>
    </MotiView>
  );
}

const Spacer = ({ height = 16 }) => <View style={{ height }} />;
