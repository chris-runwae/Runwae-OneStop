import { StyleSheet } from 'react-native';
import { textStyles } from '@/utils/styles';
import { ITINERARY_CONSTANTS } from '@/constants/itinerary';

export const createItineraryDetailStyles = (colors: any) => 
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundColors.default,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      paddingBottom: 32,
    },
    title: {
      ...textStyles.bold_20,
      fontSize: 28,
      lineHeight: 36,
      color: colors.textColors.default,
      marginBottom: 16,
    },
    metadataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 20,
      flexWrap: 'wrap',
    },
    description: {
      ...textStyles.subtitle_Regular,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textColors.subtle,
      marginBottom: 32,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      ...textStyles.bold_20,
      fontSize: 20,
      color: colors.textColors.default,
      marginBottom: 16,
    },
    dayTabs: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    backButtonContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButtonText: {
      color: colors.white,
    },
  });
