import { Pressable, View, StyleSheet } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeftIcon, X } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PrimaryButton, Spacer, Text, TextInput } from '@/components';
import useItinerary from '@/hooks/useItinerary';
import { Colors } from '@/constants';
import { textStyles } from '@/utils/styles';

const CreateItineraryScreen = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme];
  const { addTripItineraryItem, loading } = useItinerary();
  const { user } = useUser();

  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [error, setError] = useState({
    title: null,
    date: null,
    time: null,
  } as {
    title: string | null;
    date: string | null;
    time: string | null;
  });

  const dynamicStyles = StyleSheet.create({
    modalContainer: {
      backgroundColor: colors.backgroundColors.default,
      // paddingBottom: insets.bottom,
    },
  });

  const checkForErrors = useCallback(() => {
    const newError = {
      title: !title || title === null ? 'Title is required' : null,
      description: !description ? 'Description is required' : null,
      location: !location ? 'Location is required' : null,
      date: !date ? 'Date is required' : null,
      time: !time ? 'Time is required' : null,
    };

    setError(newError);

    return Object.values(newError).some((value) => value !== null);
  }, [title, description, location, date, time]);

  const handleCreateItinerary = useCallback(async () => {
    if (!user?.id) return;

    if (checkForErrors()) return;
    // const data = await addTripItineraryItem({
    //   title: title,
    //   description: description,
    //   location: location,
    //   date: date,
    //   time: time,
    //   created_by: user?.id,
    // });
    console.log(
      'Creating itinerary item: ',
      JSON.stringify(
        {
          title: title,
          description: description,
          location: location,
          date: date,
          time: time,
          created_by: user?.id,
        },
        null,
        2
      )
    );
  }, [title, description, location, date, time]);

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
        <TextInput
          placeholder="Enter title"
          variant="default"
          label="Title"
          value={title ?? undefined}
          onChangeText={setTitle}
          error={error?.title ?? undefined}
          isRequired={true}
        />
        <Spacer size={16} vertical />
        <TextInput
          placeholder="Enter description"
          variant="default"
          label="Description"
          value={description ?? undefined}
          onChangeText={setDescription}
        />
        <Spacer size={16} vertical />
        <TextInput
          placeholder="Enter location"
          variant="default"
          label="Location"
          value={location ?? undefined}
          onChangeText={setLocation}
        />
        <Spacer size={16} vertical />
        <TextInput
          placeholder="Enter date"
          variant="default"
          label="Date"
          value={date ?? undefined}
          onChangeText={setDate}
          error={error?.date ?? undefined}
          isRequired={true}
        />
        <Spacer size={16} vertical />
        <TextInput
          placeholder="Enter time"
          variant="default"
          label="Time"
          value={time ?? undefined}
          onChangeText={setTime}
          error={error?.time ?? undefined}
          isRequired={true}
        />

        <Spacer size={40} vertical />
        {/* <Button variant="filled" size="md" onPress={() => router.dismiss()}>
          Create Itinerary
        </Button> */}
        {/* <PrimaryButton
          onPress={() => router.dismiss()}
          title="Create Itinerary"
          // width={200}
        /> */}
        <PrimaryButton
          onPress={handleCreateItinerary}
          title="Create Itinerary"
          // disabled={}
          loading={loading}
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
