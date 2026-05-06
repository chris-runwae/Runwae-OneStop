import AddToTripContent from '@/components/home/AddToTripContent';
import CustomModal from '@/components/ui/CustomModal';
import { ExternalLink } from '@/components/ui/external-link';
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
      <Pressable
        onPress={handlePress}
        className="mb-6 mr-4"
        style={{ width: 177 }}>
        <View className="relative">
          <Image
            source={{ uri: item.imageUri }}
            className="aspect-square w-full rounded-t-2xl"
            resizeMode="cover"
          />
          <View className="absolute left-2 top-2 flex-row items-center rounded-full bg-black/50 px-2.5 py-1">
            <Text className="text-[10px] font-medium text-white">
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
            className="mt-1 text-sm text-gray-500 dark:text-gray-400"
            style={{ fontFamily: 'Inter' }}>
            {item.description}
          </Text>
          {item.price != null && (
            <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              From {item.currency === 'USD' ? '$' : `${item.currency} `}
              {item.price.toFixed(0)}
            </Text>
          )}

          <View className="mt-4 flex-row items-end justify-between">
            <TouchableOpacity onPress={handlePress}>
              <Text className="text-sm font-semibold text-primary underline">
                View Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsModalVisible(true)}
              className="h-[35px] w-[66px] flex-row items-center justify-center gap-x-1 rounded-[6px] bg-primary">
              <Plus size={14} color="#fff" />
              <Text className="text-sm text-white">Add</Text>
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
