import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Spacer, Text, TextInput } from "@/components";
import { Colors, textStyles } from "@/constants";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { usePlacesAutocomplete } from "@/hooks/usePlacesAutoComplete";
import type { LiteAPIPlace } from "@/hooks/usePlacesAutoComplete";
import { useTrips } from "@/context/TripsContext";

export default function AddDestinationScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const { query, setQuery, results } = usePlacesAutocomplete();
  const { updateDestination, isLoading } = useTrips();

  const [selectedPlace, setSelectedPlace] = useState<LiteAPIPlace | null>(null);

  const handleSelectPlace = (place: LiteAPIPlace) => {
    setSelectedPlace(place);
    setQuery(`${place.displayName}, ${place.formattedAddress}`);
  };

  const handleConfirm = async () => {
    if (!selectedPlace) return;
    try {
      await updateDestination(tripId, selectedPlace);
      Alert.alert("Success", "Destination updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update destination. Please try again.");
      console.error(error);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ paddingTop: 32, paddingHorizontal: 16 }}
      contentContainerStyle={{ flexGrow: 1 }}
      bottomOffset={100}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>Where&apos;s your next adventure? 🚀</Text>
        <Text style={styles.subtitle}>Please select a destination.</Text>
        <Spacer size={16} vertical />

        <View style={styles.form}>
          <View>
            <TextInput
              label="Destination Name"
              placeholder="Search for a destination"
              style={styles.destinationNameInput}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setSelectedPlace(null); // clear selection if user edits
              }}
            />

            {/* Results list — only show when no selection made */}
            {results.length > 0 && !selectedPlace && (
              <View style={styles.resultsContainer}>
                {results.map((place) => (
                  <TouchableOpacity
                    key={place.placeId}
                    style={styles.resultItem}
                    onPress={() => handleSelectPlace(place)}
                  >
                    <Text style={styles.resultName}>{place.displayName}</Text>
                    <Text style={styles.resultAddress}>{place.formattedAddress}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, !selectedPlace && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={!selectedPlace}
          >
            <Text style={styles.buttonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    ...textStyles.textHeading20,
    textAlign: "center",
  },
  subtitle: {
    ...textStyles.textBody12,
    textAlign: "center",
  },
  destinationNameInput: {
    ...textStyles.textBody12,
    borderWidth: 2,
    backgroundColor: Colors.light.borderDefault,
    borderColor: Colors.light.borderDefault,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },

  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  buttonText: {
    ...textStyles.textBody12,
    color: Colors.light.background,
    textAlign: "center",
  },

  form: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  resultsContainer: {
    borderWidth: 1,
    borderColor: Colors.light.borderDefault,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderDefault,
  },
  resultName: {
    ...textStyles.textBody14,
    fontWeight: '500',
  },
  resultAddress: {
    ...textStyles.textBody12,
    color: Colors.light.textBody,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

});