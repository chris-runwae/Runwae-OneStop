import { ScreenContainer } from '@/components';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Report = () => {
  const insets = useSafeAreaInsets();
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
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

  const issueTypes = [
    'Bug Report',
    'Feature Request',
    'Performance Issue',
    'UI/UX Issue',
    'Login/Authentication',
    'Payment Issue',
    'Other',
  ];

  const DropdownSelect = () => (
    <View>
      <Text className="mb-2 text-black dark:text-gray-400">Issue Type</Text>
      <TouchableOpacity
        onPress={() => setShowDropdown(true)}
        className="w-full flex-row items-center justify-between rounded-[14px] bg-gray-100 px-[12px] py-[16px] dark:bg-gray-900/50">
        <Text
          className={`flex-1 ${selectedIssue ? 'text-black dark:text-white' : 'text-gray-500'}`}>
          {selectedIssue || 'Select issue type'}
        </Text>
        <ChevronDown size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </View>
  );

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
          <View className="flex-1 flex-col justify-between">
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                Something not working right? Tell us what happened so we can fix
                it fast.
              </Text>

              <View className="mt-14 flex-col gap-y-5">
                <DropdownSelect />
                <View>
                  <Text className="mb-2 text-black dark:text-gray-400">
                    Issue Details
                  </Text>
                  <TextInput
                    className="min-h-[100px] w-full rounded-[14px] bg-gray-100 px-[12px] py-[12px] text-black dark:bg-gray-900/50 dark:text-white"
                    placeholder="Describe the issue..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    textAlignVertical="top"
                    style={{
                      minHeight: 130,
                      maxHeight: 200,
                      lineHeight: 20,
                    }}
                  />
                </View>
                <View>
                  <Text className="mb-2 text-black dark:text-gray-400">
                    Contact Email
                  </Text>
                  <TextInput
                    className="w-full rounded-[14px] bg-gray-100 px-[12px] py-[16px] text-black dark:bg-gray-900/50 dark:text-white"
                    placeholder="example@email.com"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            <View className="mt-8">
              <TouchableOpacity className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-pink-600">
                <Text className="font-semibold text-white">Submit Report</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dropdown Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity
          className="flex-1 justify-center bg-black/50"
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}>
          <View className="mx-4 rounded-2xl bg-white p-4 dark:bg-black">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-black dark:text-white">
                Select Issue Type
              </Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {issueTypes.map((issue) => (
                <TouchableOpacity
                  key={issue}
                  className="border-b border-gray-100 py-3 dark:border-gray-800"
                  onPress={() => {
                    setSelectedIssue(issue);
                    setShowDropdown(false);
                  }}>
                  <Text className="text-base text-black dark:text-white">
                    {issue}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenContainer>
  );
};

export default Report;
