import CustomModal from '@/components/ui/CustomModal';
import React from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

interface MonthYearModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  title: string;
  items: { id: string; name: string }[];
  currentId: string;
  theme?: any;
  backgroundColor?: string;
}

export const MonthYearModal: React.FC<MonthYearModalProps> = ({
  visible,
  onClose,
  onSelect,
  title,
  items,
  currentId,
  theme,
  backgroundColor,
}) => {
  // Sort items: current item first, then others
  const sortedItems = [...items].sort((a, b) => {
    if (a.id === currentId) return -1;
    if (b.id === currentId) return 1;
    return 0;
  });

  return (
    <CustomModal
      isVisible={visible}
      onClose={onClose}
      title={title}
      centeredTitle={true}
      showIndicator={true}>
      <ScrollView showsVerticalScrollIndicator={false} className="max-h-80">
        {sortedItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              onSelect(item.id);
              onClose();
            }}
            className="flex-row items-center border-b border-gray-50 px-2 py-4 last:border-0 dark:border-white/5">
            <Text
              className={`text-base ${
                item.id === currentId
                  ? 'font-bold text-primary'
                  : 'text-gray-900 dark:text-gray-300'
              }`}>
              {item.name}
              {item.id === currentId && ' (Current)'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </CustomModal>
  );
};
