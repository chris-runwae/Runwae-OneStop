import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import React from "react";

import { RelativePathString, router } from 'expo-router';
import { MoveRight } from 'lucide-react-native';
import { Colors } from "@/constants/theme";

const ExpandLink = ({
  linkText,
  linkTo,
}: {
  linkText: string;
  linkTo?: RelativePathString;
}) => {
  const colorScheme = useColorScheme() ?? 'light';

  if (!linkTo) {
    return (
      <View style={styles.linkContainer}>
        <Text style={styles.linkText}>{linkText}</Text>
        <MoveRight size={20} color={Colors[colorScheme].pink500} />
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => router.push(linkTo!)}
      style={styles.linkContainer}>
      <Text style={[styles.linkText, { color: Colors[colorScheme].pink500 }]}>{linkText}</Text>
      <MoveRight size={20} color={Colors[colorScheme].pink500} />
    </Pressable>
  );
};


export default ExpandLink;


const styles = StyleSheet.create({
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  linkText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'DM Sans',
    lineHeight: 24,
    letterSpacing: 0,
  },
});
