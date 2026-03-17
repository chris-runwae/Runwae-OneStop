import { AddOn } from "@/constants/home.constant";
import { Plus } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface AddOnCardProps {
  item: AddOn;
  fullWidth?: boolean;
}

const AddOnCard = ({ item, fullWidth = false }: AddOnCardProps) => (
  <View
    className="rounded-t-[16px] mr-3"
    style={{ width: fullWidth ? "100%" : 315 }}
  >
    <Image
      source={{ uri: item.image }}
      className="w-full h-[150px] rounded-t-[16px]"
      resizeMode="cover"
    />
    <View className="mt-2 rounded-b-[16px]">
      <Text className="text-gray-400 dark:text-gray-500 text-sm mb-1.5">
        {item.category} • {item.rating}/5
      </Text>

      <Text
        className="text-black dark:text-white font-bold text-xl leading-tight mb-2"
        style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {item.title}
      </Text>

      <Text
        className="text-gray-500 dark:text-gray-400 text-sm leading-snug mb-2"
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {item.description}
      </Text>

      <TouchableOpacity className="mb-4">
        <Text className="text-primary text-sm underline decoration-primary">
          View Details
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-end justify-between mt-auto">
        <View>
          <Text className="text-gray-400 dark:text-gray-500 text-sm mb-0.5">
            from
          </Text>
          <Text className="text-black dark:text-white font-medium text-xl">
            ${item.price}
          </Text>
        </View>

        <TouchableOpacity className="bg-primary rounded-full h-[42px] w-[110px] flex-row gap-x-2 items-center justify-center">
          <Plus size={15} color="#fff" />
          <Text className="text-white text-sm">Add to trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default AddOnCard;
