import { Pressable, View, StyleSheet } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon, X } from 'lucide-react-native';
import { router, Stack } from 'expo-router';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button, PrimaryButton, Spacer, Text, TextInput } from '@/components';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/utils/styles';

// const { height: SCREEN_HEIGHT } = Dimensions.get('window');
// const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

const CreateItineraryScreen = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];

  const dynamicStyles = StyleSheet.create({
    modalContainer: {
      backgroundColor: colors.backgroundColors.default,
      // paddingBottom: insets.bottom,
    },
  });

  return (
    <>
      {/* <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => router.dismiss()}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
              }}>
              <IconSymbol
                name="chevron.left"
                size={24}
                color={colors.textColors.default}
              />
            </Pressable>
          ),
        }}
      /> */}

      <View style={[styles.modalContainer, dynamicStyles.modalContainer]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.dismiss()} style={styles.backButton}>
            <ArrowLeftIcon size={24} color={colors.textColors.default} />
          </Pressable>
          <Text style={styles.headerTitle}>Create Itinerary</Text>
        </View>

        <Spacer size={32} vertical />
        <TextInput placeholder="Enter title" variant="default" label="Title" />
        <Spacer size={16} vertical />
        <TextInput
          placeholder="Enter description"
          variant="default"
          label="Description"
        />
        <Spacer size={16} vertical />
        <TextInput
          placeholder="Enter location"
          variant="default"
          label="Location"
        />
        <Spacer size={16} vertical />
        <TextInput placeholder="Enter date" variant="default" label="Date" />
        <Spacer size={16} vertical />
        <TextInput placeholder="Enter time" variant="default" label="Time" />

        <Spacer size={40} vertical />
        {/* <Button variant="filled" size="md" onPress={() => router.dismiss()}>
          Create Itinerary
        </Button> */}
        <PrimaryButton
          onPress={() => router.dismiss()}
          title="Create Itinerary"
          // width={200}
        />
        <Spacer size={40} vertical />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    paddingHorizontal: 16,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingTop: 16,
  },
  backButton: {
    padding: 4,
  },

  headerTitle: {
    ...textStyles.bold_20,
    textAlign: 'center',
    width: '90%',
  },
});

export default CreateItineraryScreen;
