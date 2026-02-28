import { StyleSheet, TextInput as RNTextInput, TextInputProps, View, StyleProp, ViewStyle, TextStyle } from "react-native";
import React from "react";
// import { Icon } from 'lucide-react-native';

import Text from '../ui/Text';

type CustomTextInputProps = TextInputProps & {
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
  isRequired?: boolean;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  requiredType?: 'asterisk' | 'text';
};

const TextInput = (props: CustomTextInputProps) => {
  const { containerStyle, style, isRequired, label, labelStyle, requiredType = 'asterisk', ...rest } = props;

  return (
    <View style={containerStyle}>
      <View style={styles.labelContainer}>
        {label && (
          <Text
            style={[
              styles.label,
              labelStyle,
            ]}>
            {isRequired && requiredType === 'asterisk' && (
              <Text style={styles.required}>*</Text>
            )}{' '}
            {label}
          </Text>
        )}
        {isRequired && requiredType === 'text' && (
          <Text style={styles.required}>required</Text>
        )}
      </View>
      <RNTextInput {...rest} style={style} />
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.create({
  required: {
    color: 'red',
    marginRight: 4,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {

  },
  requiredText: {
    color: 'red',
    marginRight: 4,
  },
});
