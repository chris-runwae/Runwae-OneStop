import { useTheme } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import Text from '@/components/ui/Text';
import { textStyles } from '@/constants';

type Tab = {
  id: string;
  label: string;
};

type HorizontalTabsProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

const HorizontalTabs = ({
  tabs,
  activeTab,
  onTabChange,
}: HorizontalTabsProps) => {
  const { dark } = useTheme();

  const activeColor = '#FF1F8C';
  const inactiveColor = dark ? '#6B7280' : '#A8A8A8';
  const borderColor = dark ? '#262626' : '#E9ECEF';

  return (
    <View style={[styles.mainContainer, { borderBottomColor: borderColor }]}>
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
                style={styles.tabButton}>
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? activeColor : inactiveColor },
                    isActive && styles.tabTextActive,
                  ]}>
                  {tab.label.toUpperCase()}
                </Text>
                {isActive && (
                  <View
                    style={[styles.indicator, { backgroundColor: activeColor }]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default HorizontalTabs;

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabText: {
    ...textStyles.textBody14,
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    borderRadius: 1,
  },
});
