import { SwitchOptionType } from '@/types/switch-options.type';

export const twoFaOptionProps: SwitchOptionType[] = [
  {
    title: 'Text Message',
    subtitle: 'Receive updates about your account activity.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
  {
    title: 'Authentication App',
    subtitle: 'Receive secure codes for added protection.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
  {
    title: 'Email Address',
    subtitle: 'Receive security alerts and important updates.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
];

export const privacySettingOptions: SwitchOptionType[] = [
  {
    title: 'Public',
    subtitle: 'Anyone can see your trip details.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
  {
    title: 'Private',
    subtitle: 'Visible only to your followers and following.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
  {
    title: 'Friends Only',
    subtitle: 'Visible only to your following.',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
  {
    title: 'Custom',
    subtitle: 'Customize your privacy settings per trip',
    checked: false,
    setChecked: (checked: boolean) => {},
  },
];
