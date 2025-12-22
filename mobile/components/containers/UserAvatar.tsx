import { StyleSheet, View } from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import { Image } from 'expo-image';

type UserAvatarProps = {
  size?: number;
  userImage?: string;
};

const UserAvatar = ({ size = 40, userImage }: UserAvatarProps) => {
  const { user } = useUser();

  const styles = StyleSheet.create({
    container: {
      height: size,
    },
    image: {
      width: size,
      height: size,
      borderRadius: 99,
    },
  });

  if (!user) {
    return <></>;
  }

  return (
    <View style={styles.container}>
      <Image
        source={userImage || user?.imageUrl}
        style={styles.image}
        contentFit="cover"
      />
    </View>
  );
};

export default UserAvatar;
