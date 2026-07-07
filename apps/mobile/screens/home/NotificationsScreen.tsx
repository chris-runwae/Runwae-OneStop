import { Stack } from 'expo-router';
import { useQuery } from 'convex/react';
import { Image as ExpoImage, useImage } from 'expo-image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View, Text } from 'react-native';

export default function NotificationsScreen() {
  return (
    <>
      <View style={{ flex: 1 }}>
        <Text>Notifications</Text>
      </View>
    </>
  );
}