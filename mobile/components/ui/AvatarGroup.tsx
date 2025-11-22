import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { TripAttendee } from '@/types/trips.types';

// type Attendee = {
//   id: string;
//   name?: string;
//   profile_photo_url?: string;
// };

type AvatarGroupProps = {
  attendees: TripAttendee[];
  maxVisible?: number; // default 4
  size?: number; // avatar size in pixels
  overlap?: number; // overlap in pixels
};

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  attendees,
  maxVisible = 4,
  size = 40,
  overlap = 12,
}) => {
  const visible = attendees.slice(0, maxVisible);
  const remaining = attendees.length - maxVisible;

  return (
    <View style={[styles.container, { height: size }]}>
      {visible.map((user, index) => (
        <View
          key={user.id}
          style={[
            styles.avatarWrapper,
            {
              left: index * (size - overlap),
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}>
          {user.profile_photo_url ? (
            <Image
              source={{ uri: user.profile_photo_url }}
              style={{ width: size, height: size, borderRadius: size / 2 }}
            />
          ) : (
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: '#ccc',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: '#fff' }}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>
      ))}

      {remaining > 0 && (
        <View
          style={[
            styles.avatarWrapper,
            {
              left: maxVisible * (size - overlap),
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#999',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
  },
  avatarWrapper: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
