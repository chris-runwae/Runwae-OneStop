import { StyleSheet, View } from 'react-native';
import React from 'react';
import { ExpandLink, Spacer, ExpandLinkProps, Text } from '@/components';
import { textStyles } from '@/utils/styles';

type SectionHeaderProps = ExpandLinkProps & {
  title: string;
};

const SectionHeader = ({ title, linkText, linkTo }: SectionHeaderProps) => {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeadersText}>{title}</Text>
        {linkText && <ExpandLink linkText={linkText} linkTo={linkTo!} />}
      </View>

      <Spacer size={12} vertical />
    </>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  //Text Styles
  sectionHeadersText: {
    ...textStyles.bold_20,
    fontSize: 18,
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
