import { StyleSheet, View, useColorScheme } from 'react-native';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

import { Colors } from '@/constants';

export default function TripDiscoverySkeleton() {
  const colorMode = useColorScheme() ?? 'light';
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    shape: {
      justifyContent: 'center',
      height: 250,
      width: 250,
      borderRadius: 25,
      marginRight: 10,
    },
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
    },
  });

  return (
    <MotiView
      transition={{
        type: 'timing',
      }}
      style={[styles.container]}
      animate={{
        backgroundColor: colors.backgroundColors.default,
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Skeleton colorMode={colorMode} radius={8} height={28} width={140} />
        <Spacer height={16} />
        <Skeleton colorMode={colorMode} width={100} height={32} radius={99} />
      </View>
      <Spacer height={16} />
      <View style={{ flexDirection: 'row', width: '100%', gap: 16 }}>
        <Skeleton colorMode={colorMode} width={210} height={140} />
        <Skeleton colorMode={colorMode} width={210} height={140} />
      </View>

      <Spacer height={32} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Skeleton colorMode={colorMode} radius={8} height={28} width={140} />
        <Skeleton colorMode={colorMode} width={100} height={32} radius={99} />
      </View>
      <Spacer height={16} />
      <View style={{ flexDirection: 'row', width: '100%', gap: 16 }}>
        <Skeleton colorMode={colorMode} width={210} height={140} />
        <Skeleton colorMode={colorMode} width={210} height={140} />
      </View>
    </MotiView>
  );
}

const Spacer = ({ height = 16 }) => <View style={{ height }} />;
