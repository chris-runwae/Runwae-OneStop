import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { useTheme } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
  BackHandler,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

// ================================================================
// CreateTripSuccess
// ================================================================

export default function CreateTripSuccess() {
  const { dark } = useTheme();
  const params = useLocalSearchParams<{
    tripId: string;
    tripName: string;
    destination_label: string;
  }>();

  // Spring scale animation for the checkmark
  const scale = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withDelay(
      200,
      withSpring(1, { damping: 12, stiffness: 120 })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------
  // Navigation
  // ----------------------------------------------------------------

  const handleViewTrip = () => {
    router.push(`/(tabs)/(trips)/${params.tripId}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I'm planning a trip to ${params.destination_label}! Join me on Runwae 🌍`,
      });
    } catch {
      // Dismiss silently — share dialog was closed
    }
  };

  // ----------------------------------------------------------------
  // Hardware back intercept
  // ----------------------------------------------------------------

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleViewTrip();
        return true;
      }
    );
    return () => subscription.remove();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.tripId]);

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------

  return (
    <AppSafeAreaView>
      <View style={styles.container}>
        {/* Animated checkmark */}
        <Animated.View style={[styles.checkmarkWrapper, animatedStyle]}>
          <CheckCircle size={64} color="#FF1F8C" strokeWidth={1.5} />
        </Animated.View>

        <Text style={[styles.heading, { color: dark ? '#ffffff' : '#111827' }]}>
          Trip Created!
        </Text>

        <Text
          style={[styles.tripName, { color: dark ? '#ffffff' : '#111827' }]}>
          {params.tripName}
        </Text>

        <Text
          style={[styles.destination, { color: dark ? '#9ca3af' : '#6b7280' }]}>
          {params.destination_label}
        </Text>

        {/* CTA buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewTrip}>
            <Text style={styles.primaryButtonText}>View Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              {
                borderColor: dark ? '#2c2c2e' : '#e5e7eb',
              },
            ]}
            onPress={handleShare}>
            <Text
              style={[
                styles.secondaryButtonText,
                { color: dark ? '#ffffff' : '#111827' },
              ]}>
              Share with friends
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppSafeAreaView>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  checkmarkWrapper: {
    marginBottom: 28,
  },

  heading: {
    fontSize: 30,
    fontFamily: 'BricolageGrotesque-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  tripName: {
    fontSize: 20,
    fontFamily: 'BricolageGrotesque-SemiBold',
    marginBottom: 6,
    textAlign: 'center',
  },

  destination: {
    fontSize: 15,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },

  buttonsContainer: {
    width: '100%',
    gap: 12,
  },

  primaryButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF1F8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  secondaryButton: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
