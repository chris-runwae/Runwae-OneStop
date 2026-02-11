import React, { useState } from 'react';
import { Text, TextInput, View, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface TextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  isPassword?: boolean;
  textarea?: boolean;
  placeholderTextColor?: string;
  className?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  labelStyle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const CustomTextInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  isPassword = false,
  textarea = false,
  placeholderTextColor = '#9CA3AF',
  className = '',
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  labelStyle = 'mb-2 text-black dark:text-gray-400',
  leftIcon,
  rightIcon,
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = isPassword ? !showPassword : secureTextEntry;

  const inputClassName = textarea
    ? `min-h-[100px] w-full rounded-[14px] bg-[#F8F9FA] px-[12px] py-[12px] text-black dark:bg-[#F8F9FA]/10 dark:text-white ${className}`
    : `w-full rounded-[14px] bg-[#F8F9FA] px-[12px] py-[16px] text-black dark:bg-[#F8F9FA]/10 dark:text-white ${isPassword ? 'pr-[48px]' : ''} ${className}`;

  const inputStyle = textarea
    ? {
        minHeight: 130,
        maxHeight: 200,
        lineHeight: 20,
      }
    : {};

  return (
    <View>
      {label && <Text className={labelStyle}>{label}</Text>}
      <View
        className={`relative flex-row items-center gap-2 ${inputClassName}`}>
        {leftIcon}
        <TextInput
          secureTextEntry={isSecure}
          className="flex-1 text-gray-900 dark:text-white"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={placeholderTextColor}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={textarea}
          textAlignVertical={textarea ? 'top' : 'auto'}
          style={inputStyle}
        />
        {isPassword && !textarea && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-[12px] top-[50%] -translate-y-[50%] items-center justify-center">
            {showPassword ? (
              <EyeOff size={20} color="#9CA3AF" />
            ) : (
              <Eye size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        )}
        {rightIcon}
      </View>
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
};

export default CustomTextInput;
