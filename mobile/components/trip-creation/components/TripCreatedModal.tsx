import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS } from '@/constants';
import { textStyles } from '@/utils/styles';

const { width } = Dimensions.get('window');

interface TripCreatedModalProps {
  visible: boolean;
  destination: string;
  onClose: () => void;
  onViewItinerary: () => void;
  onShareDetails: () => void;
  isDarkMode: boolean;
}

export const TripCreatedModal: React.FC<TripCreatedModalProps> = ({
  visible,
  destination,
  onClose,
  onViewItinerary,
  onShareDetails,
  isDarkMode,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: isDarkMode ? '#1a1a1a' : COLORS.white.base,
            },
          ]}>
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Text style={styles.emojiIllustration}>🧳✈️</Text>
          </View>

          {/* Title */}
          <Text
            style={[
              textStyles.heading_24,
              styles.title,
              {
                color: isDarkMode ? COLORS.white.base : COLORS.gray[900],
              },
            ]}>
            Pack your bags!
          </Text>

          {/* Message */}
          <Text
            style={[
              textStyles.regular_16,
              styles.message,
              {
                color: isDarkMode ? COLORS.gray[300] : COLORS.gray[600],
              },
            ]}>
            You're off to {destination}! A confirmation email is on its way so
            be on the lookout for it.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: COLORS.pink.default },
              ]}
              onPress={onViewItinerary}>
              <Text
                style={[
                  textStyles.medium_16,
                  styles.buttonText,
                  { color: COLORS.white.base },
                ]}>
                View Itinerary
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                {
                  borderColor: isDarkMode ? COLORS.gray[600] : COLORS.gray[300],
                  backgroundColor: 'transparent',
                },
              ]}
              onPress={onShareDetails}>
              <Text
                style={[
                  textStyles.medium_16,
                  styles.buttonText,
                  {
                    color: isDarkMode ? COLORS.gray[300] : COLORS.gray[700],
                  },
                ]}>
                Share Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiIllustration: {
    fontSize: 80,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set in component
  },
  secondaryButton: {
    borderWidth: 1,
    // borderColor set in component
  },
  buttonText: {
    // color set in component
  },
});
