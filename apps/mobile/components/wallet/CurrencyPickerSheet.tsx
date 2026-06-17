import { SUPPORTED_CURRENCIES } from '@/utils/wallet/currencies';
import { Check } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CurrencyPickerSheetProps {
  visible: boolean;
  selected: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}

const CurrencyPickerSheet: React.FC<CurrencyPickerSheetProps> = ({
  visible,
  selected,
  onSelect,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(500);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 220 });
      translateY.value = withSpring(0, { damping: 22, stiffness: 220, mass: 0.8 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(500, { duration: 220 });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <Animated.View
          style={[{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' }, overlayStyle]}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            sheetStyle,
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              paddingBottom: insets.bottom + 12,
              backgroundColor: '#0D1B2A',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 16,
            },
          ]}>
          {/* Handle */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.18)',
              }}
            />
          </View>

          <Text
            className="mb-5 text-lg text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            Change Currency
          </Text>

          <Text className="mb-4 text-[11px] uppercase tracking-wider text-white/30"
            style={{ fontFamily: 'BricolageGrotesque-Medium' }}>
            Indicative rates · Base: GBP
          </Text>

          {SUPPORTED_CURRENCIES.map((currency) => {
            const isSelected = currency.code === selected;
            return (
              <TouchableOpacity
                key={currency.code}
                onPress={() => {
                  onSelect(currency.code);
                  onClose();
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 8,
                  backgroundColor: isSelected
                    ? 'rgba(255,46,146,0.12)'
                    : 'rgba(255,255,255,0.05)',
                  borderWidth: isSelected ? 1 : 0,
                  borderColor: isSelected ? 'rgba(255,46,146,0.25)' : 'transparent',
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 26 }}>{currency.flag}</Text>
                  <View>
                    <Text
                      style={{
                        fontSize: 15,
                        color: isSelected ? '#FF2E92' : '#ffffff',
                        fontFamily: 'BricolageGrotesque-Bold',
                      }}>
                      {currency.code}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.35)',
                        marginTop: 1,
                      }}>
                      {currency.name}
                    </Text>
                  </View>
                </View>
                {isSelected && <Check size={16} color="#FF2E92" strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CurrencyPickerSheet;
