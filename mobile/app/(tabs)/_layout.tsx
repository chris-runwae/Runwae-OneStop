import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="custom_android_drawable" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Icon sf="gear" drawable="custom_settings_drawable" />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(trips)">
        <Icon sf="paperplane.fill" drawable="custom_paperplane_drawable" />
        <Label>Trips</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(profile)">
        <Icon sf="person.fill" drawable="custom_person_drawable" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(create-trip)" role="search">
        <Icon sf="plus" drawable="custom_plus_drawable" />
        <Label>Create Trip</Label>
      </NativeTabs.Trigger>
    </NativeTabs>  
  );
}
