import { useTrips } from '@/context/TripsContext';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface TripOption {
  id: string;
  title: string;
}

interface AddToTripContentProps {
  onCancel: () => void;
  onDone: (selectedTripId: string) => void | Promise<void>;
}

const AddToTripContent = ({ onCancel, onDone }: AddToTripContentProps) => {
  const { user } = useAuth();
  const { myTrips, joinedTrips, isLoading, refreshMyTrips, refreshJoinedTrips } =
    useTrips();

  const trips: TripOption[] = useMemo(() => {
    const map = new Map<string, TripOption>();
    for (const t of [...myTrips, ...joinedTrips]) {
      if (!map.has(t.id)) {
        map.set(t.id, { id: t.id, title: t.name });
      }
    }
    return Array.from(map.values());
  }, [myTrips, joinedTrips]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    refreshMyTrips();
    refreshJoinedTrips();
  }, [user?.id, refreshMyTrips, refreshJoinedTrips]);

  useEffect(() => {
    if (!trips.length) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev && trips.some((t) => t.id === prev) ? prev : trips[0].id
    );
  }, [trips]);

  const handleDone = async () => {
    if (!selectedId || submitting || !user?.id) return;
    setSubmitting(true);
    try {
      await Promise.resolve(onDone(selectedId));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.id) {
    return (
      <View className="w-full py-2">
        <Text
          className="text-center text-base text-gray-600 dark:text-gray-400 mb-5"
          style={{ fontFamily: 'Inter' }}
        >
          Sign in to save ideas to a trip.
        </Text>
        <TouchableOpacity
          onPress={onCancel}
          className="h-[45px] rounded-full border border-gray-200 dark:border-gray-600 items-center justify-center"
        >
          <Text className="text-black dark:text-white">Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading && trips.length === 0) {
    return (
      <View className="w-full py-8 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View className="w-full py-2">
        <Text
          className="text-center text-base text-gray-600 dark:text-gray-400 mb-5"
          style={{ fontFamily: 'Inter' }}
        >
          You do not have any trips yet. Create a trip first, then save
          ideas to it.
        </Text>
        <TouchableOpacity
          onPress={onCancel}
          className="h-[45px] rounded-full border border-gray-200 dark:border-gray-600 items-center justify-center"
        >
          <Text className="text-black dark:text-white">Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="w-full">
      <View className="mb-5">
        {trips.map((trip) => {
          const isSelected = selectedId === trip.id;
          return (
            <TouchableOpacity
              key={trip.id}
              onPress={() => setSelectedId(trip.id)}
              className="flex-row items-center justify-between py-2"
              activeOpacity={0.7}
            >
              <Text
                className="text-lg text-black dark:text-white flex-1 pr-3"
                style={{ fontFamily: 'BricolageGrotesque-Medium' }}
              >
                {trip.title}
              </Text>
              <View
                className={`w-5 h-5 rounded-full border items-center justify-center ${
                  isSelected ? 'border-primary' : 'border-gray-200'
                }`}
              >
                {isSelected && (
                  <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-row gap-x-4">
        <TouchableOpacity
          onPress={onCancel}
          disabled={submitting}
          className="h-[45px] px-12 rounded-full border border-gray-200 dark:border-gray-600 items-center justify-center"
        >
          <Text className=" text-black dark:text-white">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDone}
          disabled={submitting || !selectedId}
          className="h-[45px] flex-1 rounded-full bg-primary items-center justify-center opacity-100 disabled:opacity-50"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white">Done</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddToTripContent;
