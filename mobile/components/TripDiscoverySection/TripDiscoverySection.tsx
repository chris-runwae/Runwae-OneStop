import React, { useState } from 'react';
import { View } from 'react-native';
import { useColorScheme } from '@/hooks';
import { Colors } from '@/constants';
import { Spacer, FilterTabs, TripDiscoverySkeleton } from '@/components';
import { VIATOR_CATEGORIES } from '@/utils/viatorCategories';
import { HotelsSection } from './HotelsSection';
import { ActivitiesSection } from './ActivitiesSection';
import { useTripDiscovery } from './useTripDiscovery';
import { validateAndAdjustDates } from './utils';

type TripDiscoverySectionProps = {
  tripId: string;
  countryCode?: string;
  city?: string;
  tripsHotels?: any[];
  loading?: boolean;
  placeDisplayName?: string;
  startDate?: string;
  endDate?: string;
};

const TripDiscoverySection = ({
  tripId,
  countryCode,
  city,
  tripsHotels,
  loading = false,
  placeDisplayName,
  startDate,
  endDate,
}: TripDiscoverySectionProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Validate and adjust dates if needed
  const { adjustedStartDate, adjustedEndDate } = validateAndAdjustDates(
    startDate,
    endDate
  );

  // Available filters
  const filters = [
    'All',
    'Stays 🏨',
    ...VIATOR_CATEGORIES.map((cat) => `${cat.displayName} ${cat.emoji}`),
  ];

  const [selectedFilter, setSelectedFilter] = useState('All');

  const {
    hotels,
    hotelsLoading,
    categoryData,
    activitiesLoading,
    addSavedItemLoading,
    handleAddToSavedItems,
    getCurrentCategory,
  } = useTripDiscovery({
    tripId,
    countryCode,
    city,
    tripsHotels,
    placeDisplayName,
    startDate: adjustedStartDate,
    endDate: adjustedEndDate,
    selectedFilter,
  });

  const renderContent = () => {
    if (loading || hotelsLoading) {
      return <TripDiscoverySkeleton />;
    }

    if (selectedFilter === 'All' || selectedFilter === 'Stays 🏨') {
      return (
        <HotelsSection
          hotels={hotels}
          tripsHotels={tripsHotels}
          colors={colors}
          addSavedItemLoading={addSavedItemLoading}
          onAddToSavedItems={handleAddToSavedItems}
          showHeader={true}
          loading={hotelsLoading}
        />
      );
    }

    const currentCategory = getCurrentCategory();
    if (currentCategory) {
      return (
        <ActivitiesSection
          currentCategory={currentCategory}
          categoryData={categoryData}
          activitiesLoading={activitiesLoading}
          colors={colors}
          addSavedItemLoading={addSavedItemLoading}
          onAddToSavedItems={handleAddToSavedItems}
        />
      );
    }

    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      <FilterTabs
        options={filters}
        selectedOption={selectedFilter}
        onOptionChange={setSelectedFilter}
      />
      <Spacer size={24} vertical />
      {renderContent()}
    </View>
  );
};

export default TripDiscoverySection;
