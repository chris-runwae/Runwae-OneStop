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
            title="Account Details"
            subtitle="Manage your name, contact, and security details"
            onPress={() =>
              router.push('/(tabs)/profile/account/profile-details')
            }
          />
          <MenuItem
            title="Travel Preference"
            subtitle="Choose your destinations, budget, and more"
            onPress={() =>
              router.push('/(tabs)/profile/account/travel-preference')
            }
          />
          <MenuItem
            title="Partner with Runwae"
            subtitle="Offer your venue, event, or tour"
            onPress={() => router.push('/(tabs)/profile/account/patner')}
          />
          <MenuItem
            title="Notification Settings"
            subtitle="Choose what alerts you receive"
            onPress={() =>
              router.push('/(tabs)/profile/account/notification-center')
            }
          />
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
