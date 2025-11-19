import { BlurView } from 'expo-blur';
import { ImageBackground } from 'expo-image';
import {
  // MapPin,
  Heart,
} from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

import { Spacer, Text } from '@/components';

import { Colors } from '@/constants';
import { FeaturedTrip } from '@/types/trips.types';

interface FeaturedItemsCardProps {
  data: FeaturedTrip;
}

const FeaturedItemsCard = ({ data }: FeaturedItemsCardProps) => {
  const colorScheme = useColorScheme() ?? 'light';

  const { title, destination, coverimageurl } = data;
  const image =
    coverimageurl ??
    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?auto=format&fit=crop&w=1200&q=80';

  const styles = StyleSheet.create({
    blurView: {
      width: '100%',
      justifyContent: 'center',
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 0.2,
      borderColor: Colors[colorScheme].white,
      overflow: 'hidden',
    },
    destinationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    imageContainer: {
      width: 327,
      height: 416,
      borderRadius: 16,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 12,
      paddingHorizontal: 8,
    },

    linkContainer: {
      backgroundColor: Colors[colorScheme].white,
      position: 'absolute',
      top: 0,
      right: 0,
      height: 56,
      width: 52,
      borderBottomLeftRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },

    //Text Styles
    title: {
      color: Colors[colorScheme].white,
      fontSize: 18,
      fontWeight: 'bold',
    },
    subtitle: {
      color: Colors[colorScheme].white,
      fontSize: 14,
      fontWeight: 'normal',
    },
  });

  const LinkArrow = () => {
    return (
      <Pressable onPress={() => {}} style={styles.linkContainer}>
        <Heart size={24} color={Colors[colorScheme].primaryColors.default} />
      </Pressable>
    );
  };

  return (
    <ImageBackground
      source={image}
      style={styles.imageContainer}
      contentFit="cover"
      transition={1000}>
      <LinkArrow />
      <BlurView intensity={13} style={styles.blurView}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Spacer size={8} vertical />
        <View style={styles.destinationContainer}>
          {/* <MapPin size={16} color="white" /> */}
          <Text style={styles.subtitle}>{destination}</Text>
        </View>
        {/* This should be dynamic */}
        <Text style={styles.subtitle}>April 15 - May 15, 2026</Text>
      </BlurView>
    </ImageBackground>
  );
};

export default FeaturedItemsCard;
