import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/utils/styles';
import { Text } from '@/components';

type Tab = {
  id: string;
  label: string;
};

type HorizontalTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export const HorizontalTabs = ({
  tabs,
  activeTab,
  onTabChange,
}: HorizontalTabsProps) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const dynamicStyles = StyleSheet.create({
    tabButton: {
      borderBottomColor: colors.borderColors.subtle,
    },
    tabButtonActive: {
      borderBottomColor: colors.primaryColors.default,
      borderBottomWidth: 1,
    },
    tabText: {
      color: colors.textColors.default,
      fontWeight: '500', // May need this later
    },
    tabTextActive: {
      color: colors.primaryColors.default,
    },
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={[
                styles.tabButton,
                isActive
                  ? dynamicStyles.tabButtonActive
                  : dynamicStyles.tabButton,
              ]}>
              <Text
                style={[
                  styles.tabText,
                  isActive
                    ? dynamicStyles.tabTextActive
                    : dynamicStyles.tabText,
                ]}>
                {tab.label.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    // gap: 16, May need this later
  },
  tabButton: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    ...textStyles.subtitle_Regular,
    fontSize: 14,
    fontWeight: '300',
  },
});
