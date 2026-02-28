import { COLORS } from '@/constants';

export const createDestinationStyles = (isDarkMode: boolean) => ({
  // Input styles
  getInputStyle: () => ({
    backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
    borderWidth: 1,
    borderColor: isDarkMode ? '#333333' : COLORS.gray[350],
  }),

  // Text styles
  getTextColor: () => ({
    color: isDarkMode ? COLORS.white.base : COLORS.gray[750],
  }),

  getSecondaryTextColor: () => ({
    color: isDarkMode ? COLORS.gray[400] : COLORS.gray[600],
  }),

  // Dropdown styles
  getDropdownStyle: () => ({
    backgroundColor: isDarkMode ? '#222222' : COLORS.gray[350],
    borderWidth: 1,
    borderColor: isDarkMode ? '#333333' : COLORS.gray[400],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 9999,
    top: 100,
  }),

  // Pressable styles
  getPressableStyle: (pressed: boolean) => ({
    borderBottomColor: isDarkMode ? '#333333' : COLORS.gray[400],
    backgroundColor: pressed
      ? isDarkMode
        ? '#2a2a2a'
        : COLORS.gray[300]
      : 'transparent',
  }),
});
