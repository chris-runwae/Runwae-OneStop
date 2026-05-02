import React from 'react';
import { Text, View } from 'react-native';

interface EventParticipantsBarProps {
  fillPct: number;
  spotsLeft: number | null;
  currentParticipants?: number;
}

const EventParticipantsBar = ({
  fillPct,
  spotsLeft,
  currentParticipants,
}: EventParticipantsBarProps) => {
  const isUrgent = spotsLeft != null && spotsLeft <= 5;
  const label =
    spotsLeft != null && spotsLeft <= 0
      ? 'Fully booked'
      : isUrgent
        ? `Only ${spotsLeft} spots left!`
        : `${currentParticipants ?? 0} people joined`;

  return (
    <View className="px-5 pb-4 pt-2">
      <View className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${fillPct}%` }}
        />
      </View>
      <Text
        className={`mt-1.5 text-xs font-medium ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>
        {label}
      </Text>
    </View>
  );
};

export default EventParticipantsBar;
