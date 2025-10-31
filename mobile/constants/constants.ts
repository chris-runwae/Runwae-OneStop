const ORIENTATION = {
  HORIZONTAL: "horizontal",
  VERTICAL: "vertical",
};

export const ICON_NAMES = {
  BELL: "bell",
  ARROW_LEFT: "arrow-left",
  ARROW_RIGHT: "arrow-right",
  // ...more icons
} as const;

export type IconNameType = (typeof ICON_NAMES)[keyof typeof ICON_NAMES];

export const constants = {
  ORIENTATION,
  ...ORIENTATION,
  ...ICON_NAMES,
};
