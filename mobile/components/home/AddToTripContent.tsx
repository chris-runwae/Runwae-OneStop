import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TripOption {
  id: string;
  title: string;
}

const TRIPS: TripOption[] = [
  { id: "1", title: "Detty December" },
  { id: "2", title: "Birthday!" },
  { id: "3", title: "LOS2LDN" },
];

interface AddToTripContentProps {
  onCancel: () => void;
  onDone: (selectedTripId: string) => void;
}

const AddToTripContent = ({ onCancel, onDone }: AddToTripContentProps) => {
  const [selectedId, setSelectedId] = useState<string>("2"); // Birthday! selected by default in image

  return (
    <View className="w-full">
      <View className="mb-5">
        {TRIPS.map((trip) => {
          const isSelected = selectedId === trip.id;
          return (
            <TouchableOpacity
              key={trip.id}
              onPress={() => setSelectedId(trip.id)}
              className="flex-row items-center justify-between py-2"
              activeOpacity={0.7}
            >
              <Text
                className="text-lg text-black dark:text-white"
                style={{ fontFamily: "BricolageGrotesque-Medium" }}
              >
                {trip.title}
              </Text>
              <View
                className={`w-5 h-5 rounded-full border items-center justify-center ${
                  isSelected ? "border-primary" : "border-gray-200"
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
          className="h-[45px] px-12 rounded-full border border-gray-200 bg-white items-center justify-center"
        >
          <Text className=" text-black">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDone(selectedId)}
          className="h-[45px] flex-1 rounded-full bg-primary items-center justify-center"
        >
          <Text className="text-white">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddToTripContent;
