import { View, Button, Switch, StyleSheet } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";

import { Text, TextInput, Spacer } from "@/components";
import { Colors, textStyles } from "@/constants";

export default function AddPollScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const insets = useSafeAreaInsets();

  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [anonymousVoting, setAnonymousVoting] = useState(false);


  return (
    <View style={{ paddingHorizontal: 16, flex: 1, backgroundColor: Colors.light.background, height: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingTop: 24, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: Colors.light.borderDefault   }}>
        <Text style={{ fontSize: 14, textAlign: 'left', position: 'absolute', left: 0, top: 24 }} onPress={() => router.dismiss()}>Close</Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', flex: 1 }}>Add Poll</Text>
      </View>
      <Spacer size={24} vertical />

        <TextInput 
          label="Ask a question"
          isRequired
          requiredType="asterisk"
          placeholder="What would you like to know?" 
          labelStyle={{ ...textStyles.textHeading16, fontSize: 14, color: Colors.light.textHeading, marginBottom: 4 }} //TODO: This should be Inter font
          style={{ fontSize: 14, textAlign: 'left', paddingVertical: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.light.borderDefault, backgroundColor: Colors.light.containerSubtle, borderRadius: 8 }} 
        />

      <Spacer size={24} vertical />
      <View>
        <Text style={styles.pollSettingsHeading}>Poll Settings</Text>
        <Spacer size={12} vertical />
        <View style={styles.frameParent}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabelHeading}>Allow multiple answers</Text>
          </View>
          <Switch value={allowMultipleAnswers} onValueChange={() => setAllowMultipleAnswers(!allowMultipleAnswers)} />
        </View>
        <Spacer size={12} vertical />
        <View style={styles.frameParent}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabelHeading}>Allow anonymous voting</Text>
            <Text style={styles.switchLabelDescription}>People&apos;s votes will remain undisclosed</Text>
          </View>
          <Switch value={anonymousVoting} onValueChange={() => setAnonymousVoting(!anonymousVoting)} />
        </View>
      </View>

      <Spacer size={24} vertical />
        <Button title="Create Poll" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  pollSettingsHeading: {
    ...textStyles.textHeading16,
    color: Colors.light.textHeading,
    textAlign: "left"
   },
   frameParent: {
      backgroundColor: "#f8f9fa",
      borderColor: "#e9ecef",
      borderWidth: 1,
      flex: 1,
      padding: 10,
      width: "100%",
      alignSelf: "stretch",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 20,
      borderRadius: 8,
    },
    switchLabelContainer: {
      gap: 4,
    },
    switchLabelHeading: {
      ...textStyles.textHeading16,
      fontSize: 14,
      color: Colors.light.textHeading,
      textAlign: "left"
    },
    switchLabelDescription: {
      ...textStyles.textBody12,
      color: Colors.light.textBody,
      textAlign: "left"
    },
});