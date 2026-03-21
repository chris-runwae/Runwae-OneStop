import AddToTripContent from "@/components/home/AddToTripContent";
import CustomModal from "@/components/ui/CustomModal";
import { AddOn } from "@/constants/home.constant";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import React from "react";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";

interface RecommendationCardProps {
  item: AddOn;
}

const RecommendationCard = ({ item }: RecommendationCardProps) => {
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
    console.log(`Adding ${item.title} to trip ${tripId}`);
    setIsModalVisible(false);
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case "Food":
        return "🍹";
      case "Stay":
        return "🏨";
      case "Adventure":
        return "🚵";
      case "Shopping":
        return "🛍️";
      default:
        return "✨";
    }
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="mb-6 mr-4"
        style={{ width: 177 }}
      >
        <View className="relative">
          <Image
            source={{ uri: item.image }}
            className="w-full aspect-square rounded-t-2xl"
            resizeMode="cover"
          />
          <View className="absolute top-2 left-2 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center">
            <Text className="text-[10px] text-white font-medium">
              {getCategoryEmoji(item.category)} {item.category}
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <Text
            numberOfLines={1}
            className="text-lg font-bold dark:text-white"
            style={{ fontFamily: "BricolageGrotesque-Bold" }}
          >
            {item.title}
          </Text>
          <Text
            numberOfLines={2}
            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            style={{ fontFamily: "Inter" }}
          >
            {item.description}
          </Text>

          <View className="flex-row items-end justify-between mt-4">
            <TouchableOpacity onPress={handlePress}>
              <Text className="text-primary text-sm font-semibold underline">
                View Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAddToTrip}
              className="bg-primary flex-row items-center gap-x-1 h-[35px] w-[66px] justify-center rounded-[6px]"
            >
              <Plus size={14} color="#fff" />
              <Text className="text-white text-sm transition-all">Add</Text>
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

export default RecommendationCard;
