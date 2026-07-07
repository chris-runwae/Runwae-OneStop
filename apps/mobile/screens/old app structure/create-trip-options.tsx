import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

import { CreateTripChooser } from '@/components/home/CreateTripChooser';

export default function CreateTripOptionsSheet() {
  const router = useRouter();
  const params = useLocalSearchParams<{ seedDestination?: string }>();
  return (
    <CreateTripChooser
      seedDestination={params.seedDestination ?? undefined}
      onDismiss={() => {
        if (router.canGoBack()) router.back();
      }}
    />
  );
}
