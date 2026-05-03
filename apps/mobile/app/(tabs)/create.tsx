import React from 'react';

import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { CreateTripChooser } from '@/components/home/CreateTripChooser';

// In native-tabs mode this screen is what activates when the user taps the
// "Create" tab. The same chooser content renders inline (no close button —
// they're already on a tab).
export default function CreateTab() {
  return (
    <AppSafeAreaView edges={['top']}>
      <CreateTripChooser title="New trip" showCloseButton={false} />
    </AppSafeAreaView>
  );
}
