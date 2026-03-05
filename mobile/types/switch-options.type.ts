export interface SwitchOptionType {
  title: string;
  subtitle: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}
