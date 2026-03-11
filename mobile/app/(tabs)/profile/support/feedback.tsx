import { ScreenContainer } from '@/components';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';
import DropdownSelect from '@/components/ui/dropdown-select';
import CustomTextInput from '@/components/ui/custome-input';
import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';

const Feedback = () => {
  const [selectedFeedbak, setSelectedFeedbak] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const isKeyboardOpen = useKeyboardVisibility();

  const feedbackType = [
    'Bug Report',
    'Feature Request',
    'Performance Issue',
    'UI/UX Issue',
    'Login/Authentication',
    'Payment Issue',
    'Other',
  ];

  const [formData, setFormData] = useState({
    feedbackType: '',
    feedbackDetails: '',
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
                We’re building Runwae for travelers like you share your thoughts
                to help us make every trip better.
              </Text>

              <View className="mt-14 flex-col gap-y-5">
                <DropdownSelect
                  label="Feedbacl Type"
                  options={feedbackType}
                  selectedValue={formData.feedbackType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, feedbackType: value })
                  }
                  placeholder="Select feedback type"
                />
                <View>
                  <CustomTextInput
                    label="Feedback Details"
                    textarea={true}
                    placeholder="Tell us what you think..."
                    value={formData.feedbackDetails}
                    onChangeText={(text) =>
                      setFormData({ ...formData, feedbackDetails: text })
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
                <Text className="font-semibold text-white">
                  Submit Feedback
                </Text>
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
                Select Feedback Type
              </Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {feedbackType.map((feedback) => (
                <TouchableOpacity
                  key={feedback}
                  className="border-b border-gray-100 py-3 dark:border-gray-800"
                  onPress={() => {
                    setFormData({ ...formData, feedbackType: feedback });
                    setShowDropdown(false);
                  }}>
                  <Text className="text-base text-black dark:text-white">
                    {feedback}
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

export default Feedback;
