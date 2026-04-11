import { Calendar, Clock, MapPin, Users } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  maxWidth?: boolean;
}

const StatChip = ({ icon, label, maxWidth }: StatChipProps) => (
  <View className="flex-row items-center gap-x-1.5 rounded-full bg-gray-100 px-3 py-1.5 dark:bg-white/10">
    {icon}
    <Text
      className="text-xs text-gray-500 dark:text-gray-400"
      numberOfLines={1}
      style={maxWidth ? { maxWidth: 160 } : undefined}>
      {label}
    </Text>
  </View>
);

interface EventQuickStatsProps {
  title: string;
  location?: string;
  date?: string;
  time?: string;
  maxParticipants?: number;
  currentParticipants?: number;
}

const EventQuickStats = ({
  title,
  location,
  date,
  time,
  maxParticipants,
  currentParticipants,
}: EventQuickStatsProps) => (
  <View className="px-5 pb-2 pt-5">
    <Text
      className="text-2xl font-bold leading-tight text-gray-900 dark:text-white"
      style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
      {title}
    </Text>

    <View className="mt-3 flex-row flex-wrap gap-2">
      {!!location && (
        <StatChip
          icon={<MapPin size={12} color="#9ca3af" />}
          label={location}
          maxWidth
        />
      )}
      {!!date && (
        <StatChip icon={<Calendar size={12} color="#9ca3af" />} label={date} />
      )}
      {!!time && (
        <StatChip icon={<Clock size={12} color="#9ca3af" />} label={time} />
      )}
      {maxParticipants != null && (
        <StatChip
          icon={<Users size={12} color="#9ca3af" />}
          label={`${currentParticipants ?? 0}/${maxParticipants}`}
        />
      )}
    </View>
  </View>
);

export default EventQuickStats;
