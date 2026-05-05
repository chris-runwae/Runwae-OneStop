import { TripMember } from '@/constants/home.constant';
import React from 'react';
import { Image, Text, View } from 'react-native';

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
              resizeMode="cover"
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
