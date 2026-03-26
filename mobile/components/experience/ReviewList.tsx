import { Review } from "@/constants/home.constant";
import { Star } from "lucide-react-native";
import React from "react";
import { FlatList, Image, Text, View, useColorScheme } from "react-native";

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const isDarkMode = useColorScheme() === "dark";
  const starColor = isDarkMode ? "#FFFFFF" : "#000000";

  return (
    <View className="w-[300px]">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-x-3">
          <Image
            source={{ uri: review.avatar }}
            className="w-[48px] h-[48px] rounded-full"
          />
          <View>
            <Text
              className="text-black dark:text-white font-bold text-base"
              style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
            >
              {review.name}
            </Text>
            <Text className="text-gray-400 text-xs">{review.username}</Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center gap-x-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={12}
            fill={i < review.rating ? starColor : "transparent"}
            color={i < review.rating ? starColor : "#D1D5DB"}
          />
        ))}
        <Text className="text-gray-400 text-sm">• {review.date}</Text>
      </View>
      <Text className="text-gray-500 text-base leading-normal" numberOfLines={3}>
        {review.comment}
      </Text>
    </View>
  );
};

interface ReviewListProps {
  reviews: Review[];
  totalReviews: number;
}

const ReviewList = ({ reviews, totalReviews }: ReviewListProps) => {
  if (!reviews || reviews.length === 0) return null;

  return (
    <View className="mt-5">
      <View className="flex-row items-center px-5 mb-4 gap-x-2">
        <Text
          className="text-black dark:text-white text-xl font-bold"
          style={{ fontFamily: "BricolageGrotesque-ExtraBold" }}
        >
          Reviews
        </Text>
        <Text className="text-gray-400 text-sm">({totalReviews} reviews)</Text>
      </View>
      <FlatList
        data={reviews}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <ReviewCard review={item} />}
      />
    </View>
  );
};

export default ReviewList;
