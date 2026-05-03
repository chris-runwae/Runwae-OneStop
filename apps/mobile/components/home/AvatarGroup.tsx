import { TripMember } from '@/constants/home.constant';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';

interface AvatarGroupProps {
  members: TripMember[];
  extraMembers: number;
  maxDisplay?: number;
}

const AvatarGroup = ({
  members,
  extraMembers,
  maxDisplay = 3,
}: AvatarGroupProps) => {
  return (
    <View className="flex-row items-center">
      {members.slice(0, maxDisplay).map((member, index) => (
        <View
          key={index}
          className="h-[25px] w-[25px] items-center justify-center overflow-hidden rounded-full"
          style={{
            marginLeft: index > 0 ? -10 : 0,
            backgroundColor: member.color || '#6b7280',
          }}>
          {member.image ? (
            <Image
              source={{ uri: member.image }}
              className="h-full w-full"
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
              recyclingKey={member.image}
            />
          ) : (
            <Text className="text-[9px] font-bold text-white">
              {member.initials}
            </Text>
          )}
        </View>
      ))}
      {extraMembers > 0 && (
        <View
          className="h-[25px] w-[25px] items-center justify-center rounded-full bg-primary"
          style={{ marginLeft: -10 }}>
          <Text className="text-[9px] font-bold text-white">
            +{extraMembers}
          </Text>
        </View>
      )}
    </View>
  );
};

export default AvatarGroup;
