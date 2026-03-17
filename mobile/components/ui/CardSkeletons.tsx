import React from "react";
import { View } from "react-native";
import SkeletonBox from "./SkeletonBox";

export const TripCardSkeleton = () => (
  <View
    className="rounded-2xl overflow-hidden mr-3"
    style={{ width: 360, height: 250 }}
  >
    <SkeletonBox width={360} height={250} borderRadius={16} />
  </View>
);

export const ItineraryCardSkeleton = ({
  fullWidth = false,
  height = 245,
}: {
  fullWidth?: boolean;
  height?: number;
}) => (
  <View
    className="rounded-[24px] overflow-hidden bg-white dark:bg-dark-seconndary/50 p-1"
    style={{ width: fullWidth ? "100%" : 338, height }}
  >
    <SkeletonBox
      width={fullWidth ? "100%" : 330}
      height={height - 10}
      borderRadius={20}
    />
  </View>
);

export const AddOnCardSkeleton = ({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) => (
  <View
    className="rounded-t-[16px] mr-3"
    style={{ width: fullWidth ? "100%" : 315 }}
  >
    <SkeletonBox
      width={fullWidth ? "100%" : 315}
      height={150}
      borderRadius={16}
    />
    <View className="mt-4 space-y-3">
      {/* Category & Rating */}
      <SkeletonBox width={100} height={14} borderRadius={4} />

      {/* Title */}
      <View className="mt-2">
        <SkeletonBox
          width={fullWidth ? "90%" : 280}
          height={24}
          borderRadius={4}
        />
      </View>

      {/* Description */}
      <View className="flex-col gap-y-1 mt-2">
        <SkeletonBox
          width={fullWidth ? "100%" : 300}
          height={13}
          borderRadius={4}
        />
        <SkeletonBox
          width={fullWidth ? "70%" : 200}
          height={13}
          borderRadius={4}
        />
      </View>

      {/* Bottom Row: Price and Button */}
      <View className="flex-row items-end justify-between mt-4">
        <View className="gap-y-1 flex-col">
          <SkeletonBox width={40} height={12} borderRadius={4} />
          <SkeletonBox width={60} height={20} borderRadius={4} />
        </View>
        <SkeletonBox width={110} height={42} borderRadius={21} />
      </View>
    </View>
  </View>
);

export const DestinationCardSkeleton = ({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) => (
  <View
    className={fullWidth ? "" : "mr-3"}
    style={{ width: fullWidth ? "100%" : 240 }}
  >
    <SkeletonBox
      width={fullWidth ? "100%" : 240}
      height={200}
      borderRadius={16}
    />
    <View className="mt-3 gap-y-2">
      <SkeletonBox
        width={fullWidth ? "80%" : 150}
        height={20}
        borderRadius={4}
      />
      <SkeletonBox
        width={fullWidth ? "60%" : 100}
        height={14}
        borderRadius={4}
      />
    </View>
  </View>
);

export const EventCardSkeleton = () => (
  <View className="flex-row items-center py-3 border-b border-b-gray-200 dark:border-b-dark-seconndary">
    <SkeletonBox width={80} height={80} borderRadius={12} />
    <View className="flex-1 ml-4 justify-center space-y-2">
      <View className="flex-row justify-between items-start">
        <SkeletonBox width={150} height={22} borderRadius={4} />
        <SkeletonBox width={60} height={18} borderRadius={4} />
      </View>
      <View className="mt-1">
        <SkeletonBox width={120} height={14} borderRadius={4} />
      </View>
      <View className="mt-2">
        <SkeletonBox width={100} height={12} borderRadius={4} />
      </View>
    </View>
  </View>
);
