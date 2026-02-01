interface TwoFaOptionProps {
  title: string;
  subtitle: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

export const twoFaOptionProps: TwoFaOptionProps[] = [
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
