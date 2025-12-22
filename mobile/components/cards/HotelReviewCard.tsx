import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import React from 'react';

import { Colors } from '@/constants/theme';
import { StarRating, Text } from '@/components';
import { textStyles } from '@/utils/styles';
import { formatDistanceToNow } from 'date-fns';

export interface HotelReviewCardProps {
  averageScore: number;
  country?: string;
  type?: string;
  name: string;
  date: string;
  headline?: string;
  language: string;
  pros?: string;
  cons?: string;
  source?: string;
}

const HotelReviewCard = ({ name, date, ...props }: HotelReviewCardProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    //Containers
    container: {
      width: 300,
      height: 150,
    },
    starRatingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    userNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    //Text styles
    userName: {
      ...textStyles.bold_20,
      fontSize: 16,
    },
    date: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.subtitle,
    },
    contentText: {
      ...textStyles.subtitle_Regular,
      fontSize: 13,
      color: colors.textColors.default,
    },
  });
  return (
    <Pressable style={styles.container}>
      <Text style={styles.userName}>{name || 'Anonymous'}</Text>
      <View style={styles.starRatingContainer}>
        <StarRating rating={props.averageScore / 2} size={13} readonly={true} />
        <Text style={styles.date}>
          {formatDistanceToNow(new Date(date))} ago
        </Text>
      </View>
      {props.headline && (
        <Text style={styles.contentText}>{props.headline}</Text>
      )}
      {props.pros && <Text style={styles.contentText}>{props.pros}</Text>}
      {props.cons && <Text style={styles.contentText}>{props.cons}</Text>}
    </Pressable>
  );
};

export default HotelReviewCard;
