import React from 'react';
import { View, StyleSheet } from 'react-native';

import { constants } from '@/constants';

const { HORIZONTAL, VERTICAL } = constants;

type SpacerProps = {
  size: number | string;
  vertical?: boolean;
  horizontal?: boolean;
  useScaling?: boolean;
  style?: any;
  testID?: string;
};

const Spacer = (props: SpacerProps) => {
  const { size, vertical = false, horizontal = false, style = {}, testID = 'spacer' } = props;

  const axis = vertical ? VERTICAL : horizontal ? HORIZONTAL : null;

  // ** ** ** ** ** FUNCTIONS ** ** ** ** **

  // ** ** ** ** ** STYLES ** ** ** ** **
  const styles = StyleSheet.create({
    container: {
      width: axis === HORIZONTAL ? size : undefined,
      minWidth: axis === HORIZONTAL ? size : undefined,
      height: axis === VERTICAL ? size : undefined,
      minHeight: axis === VERTICAL ? size : undefined,
      alignSelf: 'center',
      ...style,
      // backgroundColor: 'red', // Use this to test out your spacing
    },
  });

  // ** ** ** ** ** RENDER ** ** ** ** **
  return <View style={styles.container} testID={testID} />;
};

export default Spacer;