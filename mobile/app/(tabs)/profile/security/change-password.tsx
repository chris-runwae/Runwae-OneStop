import { ScreenContainer } from '@/components';
import CustomTextInput from '@/components/ui/custome-input';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const ChangePassword = () => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <ScreenContainer leftComponent={true} className="flex-1 px-[12px] py-[8px]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          className="flex-1 px-[12px] py-[8px]"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: isKeyboardOpen ? 150 : 100,
          }}>
          <View className="flex-1 flex-col gap-y-[20px]">
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Enter a Password that you can remember. New password can not be
                the same as your old password
              </Text>

              <View className="mt-14 flex-col gap-y-5">
                <CustomTextInput
                  label="Current Password"
                  secureTextEntry={true}
                  isPassword={true}
                />
                <CustomTextInput
                  label="New Password"
                  secureTextEntry={true}
                  isPassword={true}
                />
                <CustomTextInput
                  label="Confirm New Password"
                  secureTextEntry={true}
                  isPassword={true}
                />
              </View>
            </View>

            <View className="mt-8">
              <TouchableOpacity className="flex h-[50px] w-full items-center justify-center rounded-full bg-pink-600">
                <Text className="font-semibold text-white">
                  Change Password
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default ChangePassword;
