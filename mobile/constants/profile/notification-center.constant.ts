import { SwitchOptionType } from '@/types/switch-options.type';

export const notificationCenterOptions: SwitchOptionType[] = [
  {
    title: 'Trip Updates',
    subtitle: 'Stay informed on your travel plans.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
  {
    title: 'Events Reminders',
    subtitle: 'Get reminders as your events get closer.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
  {
    title: 'App Notifications',
    subtitle: 'Get updates on new features and highlights.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
  {
    title: 'Promotions & Offers',
    subtitle: 'Hear about deals and partner trips.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
  {
    title: 'Email Notifications',
    subtitle: 'Manage what hits your inbox.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
];
