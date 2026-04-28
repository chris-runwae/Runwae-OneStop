import AddToTripContent from '@/components/home/AddToTripContent';
import CustomModal from '@/components/ui/CustomModal';
import { useTrips } from '@/context/TripsContext';
import { savedItemFromViatorIdea } from '@/utils/savedIdeaInputs';
import type { MappedViatorIdea } from '@/hooks/useViatorCategory';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface RecommendationCardProps {
  item: MappedViatorIdea;
}

const RecommendationCard = ({ item }: RecommendationCardProps) => {
  const router = useRouter();
  const { addIdeaToTrip } = useTrips();
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const isNavigating = React.useRef(false);

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.navigate(`/viator/${item.id}`);
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  const handleModalDone = async (tripId: string) => {
    try {
      await addIdeaToTrip(tripId, savedItemFromViatorIdea(item));
      setIsModalVisible(false);
      Alert.alert('Saved', 'Added to your trip Ideas.');
    } catch (e) {
      Alert.alert(
        'Could not save',
        e instanceof Error ? e.message : 'Please try again.'
      );
    }
  };

  return (
    <>
      <Pressable onPress={handlePress} className="mb-6 mr-4" style={{ width: 177 }}>
        <View className="relative">
          <Image
            source={{ uri: item.imageUri }}
            className="w-full aspect-square rounded-t-2xl"
            resizeMode="cover"
          />
          <View className="absolute top-2 left-2 bg-black/50 px-2.5 py-1 rounded-full flex-row items-center">
            <Text className="text-[10px] text-white font-medium">
              {item.categoryLabel}
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <Text
            numberOfLines={1}
            className="text-lg font-bold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
            {item.title}
          </Text>
          <Text
            numberOfLines={2}
            className="text-sm text-gray-500 dark:text-gray-400 mt-1"
            style={{ fontFamily: 'Inter' }}>
            {item.description}
          </Text>
          {item.price != null && (
            <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              From {item.currency === 'USD' ? '$' : `${item.currency} `}
              {item.price.toFixed(0)}
            </Text>
          )}

          <View className="flex-row items-end justify-between mt-4">
            <TouchableOpacity onPress={handlePress}>
              <Text className="text-primary text-sm font-semibold underline">
                View Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              className="bg-primary flex-row items-center gap-x-1 h-[35px] w-[66px] justify-center rounded-[6px]">
              <Plus size={14} color="#fff" />
              <Text className="text-white text-sm">Add</Text>
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
        showIndicator>
        <AddToTripContent
          onCancel={() => setIsModalVisible(false)}
          onDone={handleModalDone}
        />
      </CustomModal>
    </>
  );
};

export default RecommendationCard;
