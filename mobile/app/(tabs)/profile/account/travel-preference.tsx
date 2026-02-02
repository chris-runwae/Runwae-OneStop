import { ScreenContainer } from '@/components';
import DropdownSelect from '@/components/ui/dropdown-select';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const TravelPreference = () => {
  const [formData, setFormData] = useState({
    airport: '',
    currency: '',
    location: '',
  });

  const airports = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD'];
  const locations = [
    'New York',
    'Los Angeles',
    'Chicago',
    'Houston',
    'Phoenix',
  ];

  return (
    <ScreenContainer leftComponent={true} className="flex-1 px-[12px] py-[8px]">
      <ScrollView
        className="flex-1 px-[12px] py-[8px]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
        }}>
        <View className="flex-1 flex-col">
          <View>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Set your home base, currency, and travel style so every
              recommendation feels made just for you.
            </Text>

            <View className="mt-14 flex-col gap-y-5">
              <DropdownSelect
                label="Default Airport"
                options={airports}
                selectedValue={formData.airport}
                onValueChange={(value) =>
                  setFormData({ ...formData, airport: value })
                }
                placeholder="Select default airport"
              />
              <View>
                <DropdownSelect
                  label="Default Currency"
                  options={currencies}
                  selectedValue={formData.currency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, currency: value })
                  }
                  placeholder="Select default currency"
                />
              </View>
              <View>
                <DropdownSelect
                  label="Default Location"
                  options={locations}
                  selectedValue={formData.location}
                  onValueChange={(value) =>
                    setFormData({ ...formData, location: value })
                  }
                  placeholder="Select default location"
                />
              </View>
            </View>
          </View>

          <View className="mt-8">
            <TouchableOpacity className="flex h-[50px] w-full items-center justify-center rounded-full bg-pink-600">
              <Text className="font-semibold text-white">Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default TravelPreference;
