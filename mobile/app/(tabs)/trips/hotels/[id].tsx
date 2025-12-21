import React, { Fragment, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import RenderHtml from 'react-native-render-html';

import { InfoPill, ScreenContainer, Spacer, Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { Colors } from '@/constants';
import { useHotels } from '@/hooks';
import { facilityIconMap } from '@/utils/facilityIconMap';

const HotelDetailScreen = () => {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { hotel, loading, fetchHotelById } = useHotels();
  const [hotelData, setHotelData] = useState<any>(null);

  const dynamicStyles = StyleSheet.create({
    title: {
      color: colors.textColors.default,
    },
    facilityRowSeparator: {
      backgroundColor: colors.borderColors.default,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderColors.default,
    },
    descriptionContainer: {
      borderTopWidth: 2,
      borderBottomWidth: 2,
      borderColor: colors.borderColors.default,
      paddingVertical: 20,
    },
    descriptionText: {
      ...textStyles.regular_14,
      color: colors.borderColors.default,
    },
  });

  useEffect(() => {
    const loadHotel = async () => {
      const hotelData = await fetchHotelById(id as string);
      setHotelData(hotelData);
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

  return (
    <ScreenContainer
      leftComponent
      contentContainerStyle={{ paddingHorizontal: 8 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Spacer size={8} vertical />
        <ImageContainer />
        <Spacer size={8} vertical />
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
        {/* <Text style={styles.description}>{hotel?.description}</Text> */}
        {/* <FlashList
        data={hotel?.hotelFacilities}
        keyExtractor={(item, index) => `${item}-${index}`}
        contentContainerStyle={styles.container}
        renderItem={({ item }: { item: string }) => {
          const Icon = facilityIconMap[item]; // <--- GET ICON HERE

          return (
            <View style={styles.row}>
              {Icon ? <Icon size={20} color="#333" /> : null}
              <Text style={styles.label}>{item}</Text>
            </View>
          );
        }}
      /> */}
        <FacilitiesList />
        <Spacer size={32} vertical />
        <View style={dynamicStyles.descriptionContainer}>
          <Text style={dynamicStyles.descriptionText}>
            {hotel?.hotelDescription}
          </Text>

          {/* <Spacer size={16} vertical /> */}
          {/* <RenderHtml
          // contentWidth={width}
          source={{ html: hotel?.hotelDescription }}
        /> */}
        </View>
        <Spacer size={16} vertical />

        <Spacer size={132} vertical />
      </ScrollView>
    </ScreenContainer>
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
    // width: '100%',
    flex: 1,
    height: 95,
    // borderRadius: 16,
  },
  mainPhoto: {
    width: '100%',
    height: 186,
    // borderRadius: 16,
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
