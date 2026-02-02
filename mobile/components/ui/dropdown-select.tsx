import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ChevronDown, X } from 'lucide-react-native';

interface DropdownSelectProps {
  label: string;
  options: string[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DropdownSelect = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  className = '',
}: DropdownSelectProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setShowDropdown(false);
  };

  return (
    <>
      <View className={className}>
        <Text className="mb-2 text-black dark:text-gray-400">{label}</Text>
        <TouchableOpacity
          onPress={() => setShowDropdown(true)}
          className="w-full flex-row items-center justify-between rounded-[14px] bg-[#F8F9FA] px-[12px] py-[16px] dark:bg-[#F8F9FA]/10">
          <Text
            className={`flex-1 ${
              selectedValue ? 'text-black dark:text-white' : 'text-gray-500'
            }`}>
            {selectedValue || placeholder}
          </Text>
          <ChevronDown size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

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
                {label}
              </Text>
              <TouchableOpacity onPress={() => setShowDropdown(false)}>
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  className="border-b border-gray-100 py-3 dark:border-gray-800"
                  onPress={() => handleSelect(option)}>
                  <Text className="text-base text-black dark:text-white">
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default DropdownSelect;
