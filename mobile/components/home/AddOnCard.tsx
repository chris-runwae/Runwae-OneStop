import { AddOn } from "@/constants/home.constant";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import AddToTripContent from "./AddToTripContent";
import CustomModal from "../ui/CustomModal";

interface AddOnCardProps {
  item: AddOn;
  fullWidth?: boolean;
}

const AddOnCard = ({ item, fullWidth = false }: AddOnCardProps) => {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const isNavigating = React.useRef(false);

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate(`/experience/${item.id}`);
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  const handleAddToTrip = () => {
    setIsModalVisible(true);
  };

  const handleModalDone = (tripId: string) => {
    // Here logic to add item to trip could be added
    console.log(`Adding ${item.title} to trip ${tripId}`);
    setIsModalVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
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

          <View className="mb-4">
            <Text className="text-primary text-sm underline decoration-primary">
              View Details
            </Text>
          </View>

          <View className="flex-row items-end justify-between mt-auto">
            <View>
              <Text className="text-gray-400 dark:text-gray-500 text-sm mb-0.5">
                from
              </Text>
              <Text className="text-black dark:text-white font-medium text-xl">
                ${item.price}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleAddToTrip}
              className="bg-primary rounded-full h-[42px] w-[110px] flex-row gap-x-2 items-center justify-center"
            >
              <Plus size={15} color="#fff" />
              <Text className="text-white text-sm">Add to trip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>

      <CustomModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        title="Add to Trip"
        centeredTitle
        showCloseButton={false}
        showIndicator
      >
        <AddToTripContent
          onCancel={() => setIsModalVisible(false)}
          onDone={handleModalDone}
        />
      </CustomModal>
    </>
  );
};

export default AddOnCard;
