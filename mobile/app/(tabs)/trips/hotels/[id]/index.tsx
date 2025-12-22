import React, { Fragment, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { RelativePathString, useLocalSearchParams, router } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import RenderHtml, {
  defaultSystemFonts,
  type MixedStyleRecord,
} from 'react-native-render-html';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';

import {
  Collapsible,
  InfoPill,
  HomeScreenSkeleton,
  HotelReviewCard,
  ScreenContainer,
  SectionHeader,
  Spacer,
  Text,
  PrimaryButton,
  ScreenWithImageGallery,
} from '@/components';
import { textStyles } from '@/utils/styles';
import { Colors } from '@/constants';
import { useHotels } from '@/hooks';
import { facilityIconMap } from '@/utils/facilityIconMap';

function FontLoader({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    'dm-sans': DMSans_400Regular,
    'dm-sans-bold': DMSans_600SemiBold,
  });
  if (!fontsLoaded) {
    return null;
  }
  return <>{children}</>;
}

const systemFonts = ['dm-sans', ...defaultSystemFonts];

const HotelDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { hotel, loading, fetchHotelById, fetchHotelReviews, hotelReviews } =
    useHotels();
  // const [hotelData, setHotelData] = useState<any>(null);
  const { width } = useWindowDimensions();
  const dynamicStyles = StyleSheet.create({
    //Containers
    descriptionContainer: {},
    importantInformationContainer: {
      backgroundColor: colors.backgroundColors.subtle,
      paddingVertical: 16,
      borderRadius: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.borderColors.subtle,
    },

    //Text styles
    title: {
      color: colors.textColors.default,
    },
    subHeader: {
      ...textStyles.bold_20,
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: 0,
      color: colors.textColors.default,
      marginBottom: 8,
    },
    facilityRowSeparator: {
      backgroundColor: colors.borderColors.default,
    },
    divider: {
      height: 2,
      backgroundColor: colors.borderColors.subtle,
    },
    descriptionText: {
      ...textStyles.subtitle_Regular,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
      color: colors.textColors.subtle,
    },
  });

  //EFFECTS

  useEffect(() => {
    const loadHotelReviews = async () => {
      await fetchHotelReviews(id as string);
    };
    loadHotelReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const loadHotel = async () => {
      await fetchHotelById(id as string);
    };
    loadHotel();
  }, [fetchHotelById, id]);

  const ImageContainer = () => {
    return (
      <Pressable style={styles.imageContainer} onPress={() => {}}>
        <Image source={{ uri: hotel?.main_photo }} style={styles.mainPhoto} />
        <Spacer size={8} vertical />
        <View style={styles.helperImagesContainer}>
          {hotel?.hotelImages.slice(1, 5).map((image: any) => (
            <Image
              key={image?.url}
              source={{ uri: image?.url }}
              style={styles.image}
            />
          ))}
        </View>
      </Pressable>
    );
  };

  const FacilitiesList = () => {
    const FacilityItem = ({ item }: { item: string }) => {
      const Icon = facilityIconMap[item]; // <--- GET ICON HERE

      return (
        <View style={styles.facilityItem}>
          {Icon ? <Icon size={20} color={colors.textColors.default} /> : null}
          <Text style={styles.facilityItemLabel} numberOfLines={1}>
            {item}
          </Text>
        </View>
      );
    };

    return (
      <Pressable style={styles.facilityRow} onPress={() => {}}>
        {hotel?.hotelFacilities
          .slice(0, 4)
          .map((item: string, index: number) => (
            <Fragment key={item}>
              <FacilityItem item={item} />
              {index < hotel?.hotelFacilities.slice(0, 4).length - 1 && (
                <View
                  style={[
                    styles.facilityRowSeparator,
                    dynamicStyles.facilityRowSeparator,
                  ]}
                />
              )}
            </Fragment>
          ))}
      </Pressable>
    );
  };

  const tagStyles: MixedStyleRecord = {
    body: {
      whiteSpace: 'normal',
      fontFamily: 'dm-sans',
      color: colors.textColors.subtitle,
    },
    p: {
      marginBottom: 16,
    },
    strong: {
      fontWeight: 'bold' as const,
      fontFamily: 'dm-sans-bold',
      color: colors.textColors.default,
    },
  };

  if (loading) {
    return <HomeScreenSkeleton />;
  }

  return (
    // <ScreenContainer
    //   leftComponent
    //   contentContainerStyle={{ paddingHorizontal: 8 }}>
    //   <ScrollView showsVerticalScrollIndicator={false}>
    //     <Spacer size={8} vertical />
    //     <ImageContainer />
    //     <Spacer size={8} vertical />
    //     <Text style={[styles.title, dynamicStyles.title]}>{hotel?.name}</Text>

    //     <Spacer size={4} vertical />
    //     <View style={styles.locationTimeSpan}>
    //       <InfoPill
    //         type="destination"
    //         value={`${hotel?.city}, ${hotel?.country}`}
    //       />
    //       <InfoPill type="rating" value={hotel?.starRating} />
    //     </View>
    //     <Spacer size={12} vertical />

    //     <FacilitiesList />
    //     <Spacer size={16} vertical />
    //     <View style={[dynamicStyles.divider]} />
    //     <Spacer size={16} vertical />
    //     <View style={[dynamicStyles.descriptionContainer]}>
    //       <FontLoader>
    //         <RenderHtml
    //           contentWidth={width}
    //           source={{ html: hotel?.hotelDescription }}
    //           systemFonts={systemFonts}
    //           tagsStyles={tagStyles}
    //         />
    //       </FontLoader>
    //     </View>
    //     <View style={[dynamicStyles.divider]} />

    //     <Spacer size={16} vertical />
    //     <Collapsible title="Important Information">
    //       <View style={[dynamicStyles.importantInformationContainer]}>
    //         <Text style={[dynamicStyles.descriptionText]}>
    //           {hotel?.hotelImportantInformation}
    //         </Text>
    //       </View>
    //     </Collapsible>

    //     <Spacer size={16} vertical />
    //     <View style={[dynamicStyles.divider]} />
    //     <Spacer size={16} vertical />
    //     {hotelReviews.length > 0 && (
    //       <>
    //         <SectionHeader
    //           title="Reviews"
    //           linkText="More"
    //           linkTo={'/trips/hotels/[id]/reviews' as RelativePathString}
    //         />
    //         <FlashList
    //           data={hotelReviews}
    //           renderItem={({ item }) => <HotelReviewCard {...item} />}
    //           keyExtractor={(item) => `${item.name}-${item.date}`}
    //           horizontal
    //           showsHorizontalScrollIndicator={false}
    //           ItemSeparatorComponent={() => <Spacer size={16} horizontal />}
    //           contentContainerStyle={{ paddingHorizontal: 8 }}
    //         />
    //         <Spacer size={16} vertical />
    //         <View style={[dynamicStyles.divider]} />
    //         <Spacer size={16} vertical />
    //       </>
    //     )}

    //     {hotel?.rooms && hotel.rooms.length > 0 && (
    //       <>
    //         <PrimaryButton
    //           title="Select Rooms"
    //           onPress={() => {
    //             router.push({
    //               pathname: '/trips/hotels/room/list' as RelativePathString,
    //               params: { hotelId: id as string },
    //             });
    //           }}
    //         />
    //         <Spacer size={16} vertical />
    //       </>
    //     )}

    //     <Spacer size={132} vertical />
    //   </ScrollView>
    // </ScreenContainer>
    <ScreenWithImageGallery
      images={hotel?.hotelImages}
      header={{ title: hotel?.name }}>
      <Text style={[styles.title, dynamicStyles.title]}>{hotel?.name}</Text>

      <Spacer size={4} vertical />
      <View style={styles.locationTimeSpan}>
        <InfoPill
          type="destination"
          value={`${hotel?.city}, ${hotel?.country}`}
        />
        <InfoPill type="rating" value={hotel?.starRating} />
      </View>
      <Spacer size={12} vertical />

      <FacilitiesList />
      <Spacer size={16} vertical />
      <View style={[dynamicStyles.divider]} />
      <Spacer size={16} vertical />
      <View style={[dynamicStyles.descriptionContainer]}>
        <FontLoader>
          <RenderHtml
            contentWidth={width}
            source={{ html: hotel?.hotelDescription }}
            systemFonts={systemFonts}
            tagsStyles={tagStyles}
          />
        </FontLoader>
      </View>
      <View style={[dynamicStyles.divider]} />

      <Spacer size={16} vertical />
      <Collapsible title="Important Information">
        <View style={[dynamicStyles.importantInformationContainer]}>
          <Text style={[dynamicStyles.descriptionText]}>
            {hotel?.hotelImportantInformation}
          </Text>
        </View>
      </Collapsible>

      <Spacer size={16} vertical />
      <View style={[dynamicStyles.divider]} />
      <Spacer size={16} vertical />
      {hotelReviews.length > 0 && (
        <>
          <SectionHeader
            title="Reviews"
            linkText="More"
            linkTo={'/trips/hotels/[id]/reviews' as RelativePathString}
          />
          <FlashList
            data={hotelReviews}
            renderItem={({ item }) => <HotelReviewCard {...item} />}
            keyExtractor={(item) => `${item.name}-${item.date}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <Spacer size={16} horizontal />}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          />
          <Spacer size={16} vertical />
          <View style={[dynamicStyles.divider]} />
          <Spacer size={16} vertical />
        </>
      )}

      {hotel?.rooms && hotel.rooms.length > 0 && (
        <>
          <PrimaryButton
            title="Select Rooms"
            onPress={() => {
              router.push({
                pathname: '/trips/hotels/room/list' as RelativePathString,
                params: { hotelId: id as string },
              });
            }}
          />
          <Spacer size={16} vertical />
        </>
      )}

      <Spacer size={132} vertical />
    </ScreenWithImageGallery>
  );
};

export default HotelDetailScreen;

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    // height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  helperImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  locationTimeSpan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  image: {
    flex: 1,
    height: 95,
  },
  mainPhoto: {
    width: '100%',
    height: 186,
  },

  title: {
    ...textStyles.bold_20,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: 0,
  },

  //FlashList styles
  container: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    marginLeft: 12,
    fontSize: 15,
    color: '#222',
  },

  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    width: '100%',
    // backgroundColor: 'red',
  },
  facilityItem: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    maxWidth: '20%',
    paddingHorizontal: 4,
  },
  facilityItemLabel: {
    ...textStyles.regular_14,
    textAlign: 'center',
  },
  facilityRowSeparator: {
    width: 2,
    height: 40,
    marginHorizontal: 2,
  },
});
