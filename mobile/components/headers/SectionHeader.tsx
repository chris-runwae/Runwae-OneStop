import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { RelativePathString } from 'expo-router';
import { Fonts } from "@/constants/theme";
import { ExpandLink, Spacer } from "@/components";

const SectionHeader = ({
  title,
  linkText,
  linkTo,
}: {
  title: string;
  linkText?: string;
  linkTo?: RelativePathString;
}) => {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeadersText}>{title}</Text>
        {linkText && (
          <ExpandLink linkText={linkText} linkTo={linkTo!} />
        )}
      </View>

      <Spacer size={16} vertical />
    </>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  //Text Styles
  sectionHeadersText: {
    fontFamily: Fonts.rounded,
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
