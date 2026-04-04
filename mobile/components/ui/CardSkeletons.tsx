import React from 'react';
import { Platform, View } from 'react-native';
import SkeletonBox from './SkeletonBox';

export const TripCardSkeleton = ({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) => (
  <View
    className="overflow-hidden rounded-[20px] bg-white p-[13px] dark:bg-dark-seconndary/50"
    style={{ width: fullWidth ? '100%' : 320 }}>
    <View className="h-[138px] w-full overflow-hidden rounded-[13px] border-[3px] border-white dark:border-dark-seconndary">
      <SkeletonBox width={'100%'} height={'100%'} borderRadius={10} />
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
        <SkeletonBox width={170} height={32} borderRadius={10} />
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
    className="overflow-hidden rounded-[24px] bg-white p-1 dark:bg-dark-seconndary/50"
    style={{ width: fullWidth ? '100%' : 338, height }}>
    <SkeletonBox
      width={fullWidth ? '100%' : 330}
      height={height - 10}
      borderRadius={20}
    />
  </View>
);

export const AddOnCardSkeleton = ({
  fullWidth = false,
  index = 0,
}: {
  fullWidth?: boolean;
  index?: number;
}) => {
  const isEven = index % 2 === 0;

  return (
    <View
      className="mr-4 bg-white/0"
      style={{ width: fullWidth ? '100%' : 300 }}>
      <View className="relative mb-3 h-[180px] w-full">
        <View className="h-full w-full overflow-hidden rounded-[10px] bg-white dark:bg-dark-seconndary/50">
          <SkeletonBox width={'100%'} height={'100%'} borderRadius={10} />
        </View>

        <View
          className={`absolute h-[72px] w-[72px] overflow-hidden rounded-[10px] border-[3px] border-white bg-white dark:border-dark-seconndary dark:bg-dark-seconndary/50 ${
            isEven
              ? 'bottom-[-16px] left-[16px]'
              : 'left-[20px] top-[-16px] -rotate-12 transform'
          }`}
          style={
            Platform.OS === 'ios'
              ? {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }
              : { elevation: 4 }
          }>
          <SkeletonBox width={'100%'} height={'100%'} borderRadius={8} />
        </View>
      </View>

      <View className="mb-1.5 mt-3 px-2">
        <SkeletonBox
          width={fullWidth ? '80%' : 220}
          height={16}
          borderRadius={4}
        />
      </View>

      <View className="mt-1 flex-row items-center px-2">
        <SkeletonBox width={60} height={12} borderRadius={4} />
        <View className="mx-2 h-3 w-[1px] bg-gray-300 dark:bg-gray-600" />
        <SkeletonBox width={80} height={12} borderRadius={4} />
        <View className="mx-2 h-3 w-[1px] bg-gray-300 dark:bg-gray-600" />
        <SkeletonBox width={70} height={12} borderRadius={4} />
      </View>
    </View>
  );
};

export const DestinationCardSkeleton = ({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) => (
  <View
    className={fullWidth ? '' : 'mr-3'}
    style={{ width: fullWidth ? '100%' : 240 }}>
    <SkeletonBox
      width={fullWidth ? '100%' : 240}
      height={200}
      borderRadius={16}
    />
    <View className="mt-3 gap-y-2">
      <SkeletonBox
        width={fullWidth ? '80%' : 150}
        height={20}
        borderRadius={4}
      />
      <SkeletonBox
        width={fullWidth ? '60%' : 100}
        height={14}
        borderRadius={4}
      />
    </View>
  </View>
);

export const EventCardSkeleton = ({
  index = 0,
  fullWidth = false,
}: {
  index?: number;
  fullWidth?: boolean;
}) => {
  const rotation = index % 2 === 0 ? '-1.5deg' : '1.5deg';
  return (
    <View
      className={fullWidth ? '' : 'mr-3'}
      style={{
        flex: fullWidth ? 1 : undefined,
        width: fullWidth ? '100%' : 160,
      }}>
      <View
        className={`overflow-hidden rounded-[15px] bg-white p-1 dark:bg-dark-seconndary/50 ${fullWidth ? 'ml-[2%] aspect-[4/4.5] w-[96%]' : 'h-[145px] w-[128px]'}`}
        style={[{ transform: [{ rotate: rotation }] }]}>
        <SkeletonBox width={'100%'} height={'100%'} borderRadius={10} />
      </View>
      <View className="mt-2 flex-col gap-y-2">
        <SkeletonBox
          width={fullWidth ? '80%' : 130}
          height={16}
          borderRadius={4}
        />
        <SkeletonBox
          width={fullWidth ? '60%' : 90}
          height={12}
          borderRadius={4}
        />
      </View>
    </View>
  );
};
