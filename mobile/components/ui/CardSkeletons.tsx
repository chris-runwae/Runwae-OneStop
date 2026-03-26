import React from "react";
import { View } from "react-native";
import SkeletonBox from "./SkeletonBox";

export const TripCardSkeleton = ({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) => (
  <View
    className="overflow-hidden rounded-[20px] bg-white p-[13px] dark:bg-dark-seconndary/50"
    style={{ width: fullWidth ? '100%' : 320 }}
  >
    <View className="h-[138px] w-full overflow-hidden rounded-[13px] border-[3px] border-white dark:border-dark-seconndary">
      <SkeletonBox width={"100%"} height={"100%"} borderRadius={10} />
    </View>

    <View className="pt-3">
      <View className="mb-2">
        <SkeletonBox width={200} height={20} borderRadius={6} />
      </View>

      <View className="mb-4 flex-row items-center gap-x-2">
        <SkeletonBox width={100} height={14} borderRadius={4} />
        <SkeletonBox width={80} height={14} borderRadius={4} />
      </View>

      <View className="flex-row items-center justify-between">
        <SkeletonBox width={160} height={32} borderRadius={10} />
        <View className="flex-row items-center">
          <SkeletonBox width={28} height={28} borderRadius={14} />
          <View className="-ml-3">
            <SkeletonBox width={28} height={28} borderRadius={14} />
          </View>
          <View className="-ml-3">
            <SkeletonBox width={28} height={28} borderRadius={14} />
          </View>
        </View>
      </View>
    </View>
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

export const EventCardSkeleton = ({ index = 0, fullWidth = false }: { index?: number, fullWidth?: boolean }) => {
  const rotation = index % 2 === 0 ? '-1.5deg' : '1.5deg';
  return (
    <View className={fullWidth ? "" : "mr-3"} style={{ flex: fullWidth ? 1 : undefined, width: fullWidth ? '100%' : 160 }}>
      <View 
        className={`overflow-hidden rounded-[15px] bg-white p-1 dark:bg-dark-seconndary/50 ${fullWidth ? 'w-[96%] aspect-[4/4.5] ml-[2%]' : 'h-[145px] w-[128px]'}`}
        style={[{ transform: [{ rotate: rotation }] }]}
      >
        <SkeletonBox width={"100%"} height={"100%"} borderRadius={10} />
      </View>
      <View className="mt-2 flex-col gap-y-2">
        <SkeletonBox width={fullWidth ? "80%" : 130} height={16} borderRadius={4} />
        <SkeletonBox width={fullWidth ? "60%" : 90} height={12} borderRadius={4} />
      </View>
    </View>
  );
};
