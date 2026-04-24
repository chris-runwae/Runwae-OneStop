import { EventItineraryStep } from '@/types/content.types';
import { Clock } from 'lucide-react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { SectionTitle } from './EventDetailPrimitives';

interface ItineraryStepProps {
  step: EventItineraryStep;
  index: number;
  isLast: boolean;
}

const ItineraryStepRow = ({ step, index, isLast }: ItineraryStepProps) => (
  <View className="flex-row gap-x-4">
    <View className="items-center" style={{ width: 32 }}>
      <View className="h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <Text
          className="text-xs font-bold text-primary"
          style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
          {step.day ?? index + 1}
        </Text>
      </View>
      {!isLast && (
        <View
          className="w-[2px] flex-1 bg-gray-200 dark:bg-white/10"
          style={{ marginVertical: 4 }}
        />
      )}
    </View>

    <View className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
      {step.time && (
        <View className="mb-1 flex-row items-center gap-x-1.5">
          <Clock size={11} color="#9ca3af" />
          <Text className="text-[11px] text-gray-400">{step.time}</Text>
        </View>
      )}
      <Text
        className="font-semibold text-gray-900 dark:text-white"
        style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
        {step.title}
      </Text>
      {step.description && (
        <Text className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
          {step.description}
        </Text>
      )}
    </View>
  </View>
);

interface EventItineraryProps {
  steps: EventItineraryStep[];
}

const EventItinerary = ({ steps }: EventItineraryProps) => (
  <View className="px-5 py-6">
    <SectionTitle title="Itinerary" />
    {steps.map((step, i) => (
      <ItineraryStepRow
        key={i}
        step={step}
        index={i}
        isLast={i === steps.length - 1}
      />
    ))}
  </View>
);

export default EventItinerary;
