import type { LinkedCard, WalletBalance } from '@/types/wallet.types';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, CreditCard } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface WalletBalanceCardProps {
  balance: WalletBalance;
  card: LinkedCard | null;
  onCurrencyPress?: () => void;
}

function useCountUp(target: number, duration = 1200, delay = 200) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(0);
    const steps = 60;
    const stepDuration = duration / steps;
    let step = 0;

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(target * eased * 100) / 100);
        if (step >= steps) {
          setDisplay(target);
          clearInterval(interval);
        }
      }, stepDuration);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [target, duration, delay]);

  return display;
}

const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  balance,
  card,
  onCurrencyPress,
}) => {
  const statsOpacity = useSharedValue(0);

  useEffect(() => {
    statsOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
  }, []);

  const statsStyle = useAnimatedStyle(() => ({ opacity: statsOpacity.value }));

  const displayAvailable = useCountUp(balance.available);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: balance.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const brandLabel =
    card?.brand === 'visa'
      ? 'VISA'
      : card?.brand === 'mastercard'
        ? 'MC'
        : 'CARD';

  return (
    <Animated.View
      entering={FadeInDown.duration(500).springify()}
      className="mx-5">
      <LinearGradient
        colors={['#0A0F1E', '#0E1E3D', '#0F3460']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 28, overflow: 'hidden', padding: 24 }}>
        {/* Decorative glow blobs */}
        <View
          style={{
            position: 'absolute',
            top: -50,
            right: -30,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: '#FF2E92',
            opacity: 0.07,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#3B82F6',
            opacity: 0.08,
          }}
        />

        {/* Top row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 28,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 18,
                height: 3,
                borderRadius: 2,
                backgroundColor: '#FF2E92',
                opacity: 0.9,
              }}
            />
            <Text
              style={{
                fontSize: 11,
                letterSpacing: 2.5,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: 'BricolageGrotesque-Medium',
                textTransform: 'uppercase',
              }}>
              Runwae Pass
            </Text>
          </View>

          <TouchableOpacity
            onPress={onCurrencyPress}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.14)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              paddingHorizontal: 12,
              paddingVertical: 6,
            }}>
            <Text
              style={{
                fontSize: 13,
                color: '#ffffff',
                fontFamily: 'BricolageGrotesque-SemiBold',
              }}>
              {balance.currency}
            </Text>
            <ChevronDown
              size={12}
              color="rgba(255,255,255,0.6)"
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <View style={{ marginBottom: 28 }}>
          <Text
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.35)',
              fontFamily: 'BricolageGrotesque-Medium',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}>
            Available Cashback
          </Text>
          <Text
            style={{
              fontSize: 23,
              lineHeight: 28,
              color: '#ffffff',
              fontFamily: 'BricolageGrotesque-ExtraBold',
            }}>
            {formatCurrency(displayAvailable)}
          </Text>
        </View>

        {/* Stats */}
        <Animated.View
          style={[
            statsStyle,
            { flexDirection: 'row', gap: 20, marginBottom: 24 },
          ]}>
          <View>
            <Text
              style={{
                fontSize: 10,
                letterSpacing: 1.5,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'BricolageGrotesque-Medium',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
              Pending
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'BricolageGrotesque-SemiBold',
              }}>
              {formatCurrency(balance.pending)}
            </Text>
          </View>

          <View
            style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
          />

          <View>
            <Text
              style={{
                fontSize: 10,
                letterSpacing: 1.5,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'BricolageGrotesque-Medium',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
              Total Earned
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: '#FF2E92',
                fontFamily: 'BricolageGrotesque-SemiBold',
              }}>
              {formatCurrency(balance.lifetime)}
            </Text>
          </View>
        </Animated.View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.08)',
            marginBottom: 18,
          }}
        />

        {/* Card row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {card ? (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View
                style={{
                  height: 32,
                  width: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: 'BricolageGrotesque-Bold',
                    color: 'rgba(255,255,255,0.85)',
                    letterSpacing: 0.5,
                  }}>
                  {brandLabel}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.55)',
                    fontFamily: 'BricolageGrotesque-Medium',
                  }}>
                  •••• {card.lastFour}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.28)',
                    marginTop: 1,
                  }}>
                  Rewards active
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <CreditCard size={16} color="rgba(255,255,255,0.3)" />
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                No card linked
              </Text>
            </View>
          )}

          {card?.isActive && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                borderRadius: 20,
                backgroundColor: 'rgba(16,185,129,0.15)',
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#34d399',
                }}
              />
              <Text
                style={{
                  fontSize: 10,
                  color: '#34d399',
                  fontFamily: 'BricolageGrotesque-Medium',
                }}>
                Active
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export default WalletBalanceCard;
