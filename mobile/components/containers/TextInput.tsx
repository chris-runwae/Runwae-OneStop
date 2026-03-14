import { Eye, EyeOff } from "lucide-react-native";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

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
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "url";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
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
  placeholderTextColor = "#9CA3AF",
  className = "",
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  error,
  labelStyle = "mb-2 text-black dark:text-gray-400",
  leftIcon,
  rightIcon,
}: TextInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isSecure = isPassword ? !showPassword : secureTextEntry;

  const inputClassName = textarea
    ? `min-h-[120px] w-full rounded-lg bg-gray-50 border border-gray-200 px-4 text-black dark:bg-dark-seconndary/50 dark:border-dark-seconndary dark:text-white ${className}`
    : `w-full rounded-lg bg-gray-50 border border-gray-200 px-4 h-[45px] text-black dark:bg-dark-seconndary/50 dark:border-dark-seconndary dark:text-white ${isPassword ? "pr-[48px]" : ""} ${className} ${error ? "border-2 border-red-500" : ""}`;

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
        className={`relative flex-row items-center gap-2 ${inputClassName}`}
      >
        {leftIcon}
        <TextInput
          secureTextEntry={isSecure}
          className="flex-1 text-base text-gray-900 dark:text-white"
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={placeholderTextColor}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={textarea}
          textAlignVertical={textarea ? "top" : "auto"}
          style={inputStyle}
        />
        {isPassword && !textarea && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-[12px] items-center justify-center"
          >
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
