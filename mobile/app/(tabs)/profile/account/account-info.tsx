import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { MenuItem, Text } from '@/components';

// ACCOUNT INFO SCREEN
export default function AccountInfoScreen() {
  const router = useRouter();

  return (
    <View style={styles.accountContainer}>
      <View style={styles.accountHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.accountTitle}>Account Information</Text>
      </View>

      <View>
        <MenuItem title="Profile Details" subtitle="Profile Details" />
        <MenuItem title="Travel Preference" subtitle="Profile Details" />
        <MenuItem title="Partner with Runwae" subtitle="Profile Details" />
        <MenuItem title="Notification Settings" subtitle="Profile Details" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
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
    overflow: 'hidden',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    backgroundColor: '#ff4d6d',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    color: '#111',
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
  menuList: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
  },
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
