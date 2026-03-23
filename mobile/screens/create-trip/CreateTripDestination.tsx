import AppSafeAreaView from "@/components/ui/AppSafeAreaView";
import {
  LiteAPIPlace,
  usePlacesAutocomplete,
} from "@/hooks/usePlacesAutocomplete";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { MapPin, Search, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Toast } from "toastify-react-native";
import CreateStepHeader from "./CreateStepHeader";

// ================================================================
// Suggested destinations shown when input is empty
// ================================================================

const SUGGESTED_DESTINATIONS = [
  "Paris",
  "Tokyo",
  "New York",
  "Barcelona",
  "Dubai",
  "London",
  "Bali",
  "Lisbon",
];

// ================================================================
// CreateTripDestination
// ================================================================

export default function CreateTripDestination() {
  const { dark } = useTheme();
  const { query, setQuery, results, loading, error, clearResults } =
    usePlacesAutocomplete();
  const [selectedPlace, setSelectedPlace] = useState<LiteAPIPlace | null>(null);

  useEffect(() => {
    if (!error) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Toast.show({
      type: "error",
      text1: "📍 Lost in translation",
      text2: "Couldn't find that place — check your connection and try again.",
      position: "bottom",
      visibilityTime: 4000,
      autoHide: true,
    });
  }, [error]);

  const handleSelect = (place: LiteAPIPlace) => {
    setSelectedPlace(place);
    setQuery("");
    clearResults();
  };

  const handleClearSelection = () => {
    setSelectedPlace(null);
  };

  const handleInputChange = (text: string) => {
    if (selectedPlace) setSelectedPlace(null);
    setQuery(text);
  };

  const handleNext = () => {
    if (!selectedPlace) return;
    router.push({
      pathname: "/create-trip/days" as any,
      params: {
        destination_label: `${selectedPlace.displayName}, ${selectedPlace.formattedAddress}`,
        destination_place_id: selectedPlace.placeId,
        destination_address: selectedPlace.formattedAddress,
      },
    });
  };

  const showResults = results.length > 0 && !selectedPlace;
  const showSuggested = !query && !selectedPlace;

  return (
    <AppSafeAreaView>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <CreateStepHeader currentStep={1} totalSteps={3} />

        <Text style={[styles.title, { color: dark ? "#ffffff" : "#111827" }]}>
          Where are you headed?
        </Text>
        <Text
          style={[styles.subtitle, { color: dark ? "#9ca3af" : "#6b7280" }]}
        >
          Search for a city or destination.
        </Text>

        {/* Search input */}
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: dark ? "#1c1c1e" : "#f9fafb",
              borderColor: dark ? "#2c2c2e" : "#e5e7eb",
            },
          ]}
        >
          <Search
            size={16}
            strokeWidth={1.5}
            color={dark ? "#6b7280" : "#9ca3af"}
          />
          <TextInput
            style={[styles.input, { color: dark ? "#ffffff" : "#111827" }]}
            placeholder="Search destinations…"
            placeholderTextColor={dark ? "#4b5563" : "#9ca3af"}
            value={query}
            onChangeText={handleInputChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {(query.length > 0 || selectedPlace) && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                clearResults();
                setSelectedPlace(null);
              }}
            >
              <X
                size={16}
                strokeWidth={1.5}
                color={dark ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>
          )}
          {loading && <ActivityIndicator size="small" color="#FF1F8C" />}
        </View>

        {/* Selected place pill */}
        {selectedPlace && (
          <View
            style={[
              styles.pill,
              { backgroundColor: dark ? "#2c2c2e" : "#fdf2f8" },
            ]}
          >
            <MapPin size={14} strokeWidth={1.5} color="#FF1F8C" />
            <Text
              style={[styles.pillText, { color: dark ? "#ffffff" : "#111827" }]}
              numberOfLines={1}
            >
              {selectedPlace.displayName}
            </Text>
            <TouchableOpacity
              onPress={handleClearSelection}
              style={styles.pillClose}
            >
              <X
                size={14}
                strokeWidth={1.5}
                color={dark ? "#9ca3af" : "#6b7280"}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Results list */}
        {showResults && (
          <View
            style={[
              styles.resultsList,
              {
                backgroundColor: dark ? "#1c1c1e" : "#ffffff",
                borderColor: dark ? "#2c2c2e" : "#e5e7eb",
              },
            ]}
          >
            {results.map((place, index) => (
              <TouchableOpacity
                key={place.placeId || index}
                style={[
                  styles.resultRow,
                  index < results.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: dark ? "#2c2c2e" : "#f3f4f6",
                  },
                ]}
                onPress={() => handleSelect(place)}
              >
                <MapPin
                  size={15}
                  strokeWidth={1.5}
                  color={dark ? "#6b7280" : "#9ca3af"}
                  style={styles.resultIcon}
                />
                <View style={styles.resultTextCol}>
                  <Text
                    style={[
                      styles.resultPrimary,
                      { color: dark ? "#ffffff" : "#111827" },
                    ]}
                    numberOfLines={1}
                  >
                    {place.displayName}
                  </Text>
                  <Text
                    style={[
                      styles.resultSecondary,
                      { color: dark ? "#6b7280" : "#9ca3af" },
                    ]}
                    numberOfLines={1}
                  >
                    {place.formattedAddress}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Suggested destinations */}
        {showSuggested && (
          <View style={styles.suggestedSection}>
            <Text
              style={[
                styles.suggestedLabel,
                { color: dark ? "#9ca3af" : "#6b7280" },
              ]}
            >
              Popular destinations
            </Text>
            <View style={styles.chipsRow}>
              {SUGGESTED_DESTINATIONS.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: dark ? "#1c1c1e" : "#f3f4f6",
                      borderColor: dark ? "#2c2c2e" : "#e5e7eb",
                    },
                  ]}
                  onPress={() => setQuery(name)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: dark ? "#d1d5db" : "#374151" },
                    ]}
                  >
                    {name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Next button */}
      <View
        style={[
          styles.footer,
          { borderTopColor: dark ? "#2c2c2e" : "#f3f4f6" },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedPlace && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedPlace}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </AppSafeAreaView>
  );
}

// ================================================================
// Styles
// ================================================================

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 26,
    fontFamily: "BricolageGrotesque-Bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },

  // Input
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // Pill
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 16,
    maxWidth: "100%",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "500",
    flexShrink: 1,
  },
  pillClose: {
    padding: 2,
  },

  // Results
  resultsList: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  resultIcon: {
    flexShrink: 0,
  },
  resultTextCol: {
    flex: 1,
  },
  resultPrimary: {
    fontSize: 14,
    fontWeight: "500",
  },
  resultSecondary: {
    fontSize: 12,
    marginTop: 2,
  },

  // Suggested chips
  suggestedSection: {
    marginTop: 8,
  },
  suggestedLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nextButton: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FF1F8C",
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#fda0c9",
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
