import { ScreenContainer } from '@/components';
import CustomTextInput from '@/components/ui/custome-input';
import DropdownSelect from '@/components/ui/dropdown-select';
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

const Partner = () => {
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

  const partnerShipType = [
    'Hotel & Accommodation',
    'Restaurant & Dining',
    'Tour Operator',
    'Event Venue',
    'Transportation Service',
    'Travel Agency',
    'Activity Provider',
    'Local Guide',
    'Retail Shop',
    'Other',
  ];

  const [formData, setFormData] = useState({
    businessName: '',
    partnershipType: '',
    businessDescription: '',
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    console.log('Partner Application Submitted:', formData);
    // form validation and submission logic here
  };

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
                Set your home base, currency, and travel style so every
                recommendation feels made just for you.
              </Text>

              <View className="mt-14 flex-col gap-y-5">
                <Text
                  style={{ fontFamily: 'BricolageGrotesque_700Bold' }}
                  className="text-[18px] font-bold text-black dark:text-white">
                  Basic Information
                </Text>
                <CustomTextInput
                  label="Business Name"
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChangeText={(value) =>
                    handleInputChange('businessName', value)
                  }
                />
                <DropdownSelect
                  label="Partnership Type"
                  options={partnerShipType}
                  onValueChange={(value) =>
                    handleInputChange('partnershipType', value)
                  }
                  placeholder="Select your partnership type"
                />
                <CustomTextInput
                  label="Describe your Business"
                  textarea
                  placeholder="Tell us about your business..."
                  value={formData.businessDescription}
                  onChangeText={(value) =>
                    handleInputChange('businessDescription', value)
                  }
                />
              </View>

              <View className="mt-8 flex-col gap-y-5">
                <Text
                  style={{ fontFamily: 'BricolageGrotesque_700Bold' }}
                  className="text-[18px] font-bold text-black dark:text-white">
                  Contact Information
                </Text>
                <CustomTextInput
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                />
                <CustomTextInput
                  label="Email Address"
                  placeholder="example@gmail.com"
                  value={formData.emailAddress}
                  onChangeText={(value) =>
                    handleInputChange('emailAddress', value)
                  }
                />
                <CustomTextInput
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChangeText={(value) =>
                    handleInputChange('phoneNumber', value)
                  }
                />
              </View>
            </View>

            <View className="mt-8">
              <TouchableOpacity
                className="flex h-[50px] w-full items-center justify-center rounded-full bg-pink-600"
                onPress={handleSubmit}>
                <Text className="font-semibold text-white">
                  Submit Application
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default Partner;
