import { View, StyleSheet } from 'react-native';
import { RelativePathString, useRouter } from 'expo-router';

import { MenuItem, ScreenContainer } from '@/components';

export default function AccountInfoScreen() {
  const router = useRouter();

  return (
    <ScreenContainer
      leftComponent={true}
      contentContainerStyle={styles.accountContainer}>
      <View style={styles.accountContainer}>
        <View>
          <MenuItem
            title="Profile Details"
            subtitle="Profile Details"
            onPress={() =>
              router.push('/(tabs)/profile/account/profile-details')
            }
          />
          <MenuItem title="Travel Preference" subtitle="Profile Details" />
          <MenuItem title="Partner with Runwae" subtitle="Profile Details" />
          <MenuItem title="Notification Settings" subtitle="Profile Details" />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  accountContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
