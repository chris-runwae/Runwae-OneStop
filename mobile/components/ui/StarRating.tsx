import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Star from './Star';

export interface StarRatingProps {
  rating?: number;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
  size?: number;
}

const StarRating = ({
  rating = 0.5,
  readonly = false,
  onRatingChange = () => {},
  size = 32,
}: StarRatingProps) => {
  const [interactiveRating, setInteractiveRating] = useState(rating);
  const isControlled = onRatingChange !== undefined;
  const displayRating = isControlled ? rating : interactiveRating;

  const handleStarPress = (position: number, event: any) => {
    if (readonly) return;

    const starWidth = size;
    const touchX = event.nativeEvent.locationX;
    const isLeftHalf = touchX < starWidth / 2;

    let newRating = isLeftHalf ? position - 0.5 : position;
    newRating = Math.max(0.5, Math.min(5.0, newRating));
    newRating = Math.round(newRating * 2) / 2; // Ensure 0.5 increments

    if (isControlled) {
      onRatingChange?.(newRating);
    } else {
      setInteractiveRating(newRating);
    }
  };

  const getStarPercentage = (position: number) => {
    const current = displayRating - (position - 1);
    return Math.max(0, Math.min(1, current));
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((position) => (
        <TouchableOpacity
          key={position}
          onPress={(event) => handleStarPress(position, event)}
          activeOpacity={readonly ? 1 : 0.7}
          disabled={readonly}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Star percentage={getStarPercentage(position)} size={size} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
});

export default StarRating;
