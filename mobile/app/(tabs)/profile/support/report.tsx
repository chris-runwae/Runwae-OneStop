import { ScreenContainer } from '@/components';
import CustomTextInput from '@/components/ui/custome-input';
import DropdownSelect from '@/components/ui/dropdown-select';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Report = () => {
  const insets = useSafeAreaInsets();
  const [selectedIssue, setSelectedIssue] = useState<string>('');
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

  const [formData, setFormData] = useState({
    issueType: '',
    issueDetails: '',
    contactEmail: '',
  });

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
                <DropdownSelect
                  label="Issue Type"
                  options={issueTypes}
                  selectedValue={formData.issueType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, issueType: value })
                  }
                  placeholder="Select issue type"
                />
                <View>
                  <CustomTextInput
                    label="Issue Details"
                    textarea={true}
                    placeholder="Describe the issue..."
                    value={formData.issueDetails}
                    onChangeText={(text) =>
                      setFormData({ ...formData, issueDetails: text })
                    }
                  />
                </View>
                <View>
                  <CustomTextInput
                    label="Contact Email"
                    placeholder="example@email.com"
                    value={formData.contactEmail}
                    onChangeText={(text) =>
                      setFormData({ ...formData, contactEmail: text })
                    }
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
    </ScreenContainer>
  );
};

export default Report;
