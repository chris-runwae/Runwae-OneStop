import { useState, useEffect } from 'react';
import { Keyboard, KeyboardEventListener } from 'react-native';

/**
 * Custom hook to track keyboard visibility state
 * @returns {boolean} - Whether the keyboard is currently open
 */
export const useKeyboardVisibility = (): boolean => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardOpen(true);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardOpen(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return isKeyboardOpen;
};
