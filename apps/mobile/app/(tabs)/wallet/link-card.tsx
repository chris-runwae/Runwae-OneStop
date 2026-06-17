import AppSafeAreaView from '@/components/ui/AppSafeAreaView';
import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import {
  CheckCircle2,
  CreditCard,
  Lock,
  Shield,
  X,
  Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const STEP_BENEFITS = [
  {
    icon: Zap,
    color: '#FF2E92',
    title: 'Automatic rewards',
    description: 'Earn cashback without doing anything. Just pay and earn.',
  },
  {
    icon: Shield,
    color: '#10b981',
    title: 'Secure & private',
    description: 'We never store your card details. Rewards are detected securely.',
  },
  {
    icon: CheckCircle2,
    color: '#8b5cf6',
    title: 'Instant setup',
    description: 'Link takes 30 seconds. Start earning on your next purchase.',
  },
];

export default function LinkCardScreen() {
  const { dark } = useTheme();
  const [step, setStep] = useState<'intro' | 'form' | 'success'>('intro');
  const [cardNumber, setCardNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const successScale = useSharedValue(0);

  const successStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleLink = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setLoading(false);
    setStep('success');
    successScale.value = withSequence(
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
  };

  const isValidCard = cardNumber.replace(/\s/g, '').length === 16;

  return (
    <AppSafeAreaView edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <Text
            className="text-xl font-bold dark:text-white"
            style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
            {step === 'success' ? 'Card Linked!' : 'Link Your Card'}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-dark-seconndary">
            <X size={18} color={dark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {step === 'success' ? (
            /* ── Success state ── */
            <Animated.View
              entering={FadeIn.duration(400)}
              className="flex-1 items-center justify-center px-8 py-12">
              <Animated.View style={successStyle}>
                <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
                  <CheckCircle2 size={52} color="#10b981" />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(200).duration(400)} className="items-center">
                <Text
                  className="mb-3 text-center text-2xl font-bold dark:text-white"
                  style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                  You're all set!
                </Text>
                <Text className="mb-2 text-center text-sm leading-5 text-gray-500">
                  Your card ending in{' '}
                  <Text className="font-semibold text-black dark:text-white">
                    {cardNumber.slice(-4)}
                  </Text>{' '}
                  is now linked to your Runwae Pass.
                </Text>
                <Text className="text-center text-sm text-gray-400">
                  Pay at any partner merchant and rewards are earned automatically.
                </Text>
              </Animated.View>

              {/* Active event rewards preview */}
              <Animated.View
                entering={FadeInDown.delay(400).duration(400)}
                className="mt-8 w-full rounded-[18px] border border-primary/20 bg-primary/5 p-4">
                <Text
                  className="mb-3 text-sm font-bold text-primary"
                  style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
                  🎉 AfroNation Weekend rewards unlocked
                </Text>
                {['10% cashback at partner restaurants', '15% off grooming', 'Exclusive lounge perks'].map(
                  (perk) => (
                    <View key={perk} className="mb-1.5 flex-row items-center gap-x-2">
                      <View className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <Text className="text-xs text-gray-600 dark:text-gray-300">{perk}</Text>
                    </View>
                  )
                )}
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(600).duration(400)}
                className="mt-8 w-full">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="items-center rounded-full bg-primary py-4">
                  <Text
                    className="text-sm font-bold text-white"
                    style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
                    View My Wallet
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          ) : step === 'intro' ? (
            /* ── Intro step ── */
            <Animated.View entering={FadeIn.duration(300)} className="flex-1 px-5">
              {/* Card illustration */}
              <View className="mx-4 mb-8 mt-4 overflow-hidden rounded-[20px] bg-gradient-to-br from-gray-900 to-gray-700 p-6"
                style={{ backgroundColor: '#1A1A2E' }}>
                <View className="mb-4 flex-row items-center justify-between">
                  <Text
                    className="text-xs font-medium uppercase tracking-widest text-white/50"
                    style={{ fontFamily: 'BricolageGrotesque-Medium' }}>
                    Runwae Pass
                  </Text>
                  <View className="flex-row gap-x-1">
                    <View className="h-2 w-2 rounded-full bg-primary opacity-80" />
                    <View className="h-2 w-2 rounded-full bg-primary opacity-50" />
                  </View>
                </View>
                <Text
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: 'BricolageGrotesque-ExtraBold' }}>
                  Earn as you spend
                </Text>
                <Text className="mt-2 text-sm text-white/50">
                  Link your existing card and earn rewards automatically at partner merchants.
                </Text>
                <View className="mt-6 flex-row items-center gap-x-2">
                  <CreditCard size={16} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                  <Text className="text-xs text-white/30">•••• •••• •••• ••••</Text>
                </View>
              </View>

              {/* Benefits */}
              <View className="mb-8 gap-y-4">
                {STEP_BENEFITS.map((benefit, i) => {
                  const Icon = benefit.icon;
                  return (
                    <Animated.View
                      key={benefit.title}
                      entering={FadeInDown.delay(i * 100 + 200).duration(400)}
                      className="flex-row items-start gap-x-4 rounded-[16px] bg-white p-4 dark:bg-dark-seconndary">
                      <View
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${benefit.color}15` }}>
                        <Icon size={18} color={benefit.color} />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-sm font-bold text-black dark:text-white"
                          style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
                          {benefit.title}
                        </Text>
                        <Text className="mt-0.5 text-xs leading-4 text-gray-500">
                          {benefit.description}
                        </Text>
                      </View>
                    </Animated.View>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => setStep('form')}
                className="items-center rounded-full bg-primary py-4">
                <Text
                  className="text-sm font-bold text-white"
                  style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
                  Link a Card
                </Text>
              </TouchableOpacity>

              <Text className="mt-3 text-center text-[11px] text-gray-400">
                You can unlink your card at any time from settings
              </Text>
            </Animated.View>
          ) : (
            /* ── Form step ── */
            <Animated.View entering={FadeIn.duration(300)} className="flex-1 px-5">
              <Text className="mb-6 text-sm leading-5 text-gray-500">
                We link to your existing card. Your full card number is never stored — we only use the last 4 digits to detect eligible purchases.
              </Text>

              {/* Card number input */}
              <View className="mb-5">
                <Text
                  className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400"
                  style={{ fontFamily: 'BricolageGrotesque-SemiBold' }}>
                  Card Number
                </Text>
                <View className="flex-row items-center gap-x-3 rounded-[14px] border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-dark-seconndary">
                  <CreditCard size={18} color="#9ca3af" strokeWidth={1.5} />
                  <TextInput
                    value={cardNumber}
                    onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                    placeholder="1234 5678 9012 3456"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    className="flex-1 text-sm text-black dark:text-white"
                    style={{ fontFamily: 'BricolageGrotesque-Medium' }}
                    maxLength={19}
                  />
                </View>
              </View>

              {/* Security note */}
              <View className="mb-8 flex-row items-start gap-x-2 rounded-[12px] bg-gray-50 p-3 dark:bg-dark-seconndary">
                <Lock size={14} color="#9ca3af" style={{ marginTop: 1 }} />
                <Text className="flex-1 text-[11px] leading-4 text-gray-400">
                  Your card details are encrypted and never shared. Runwae detects purchases by matching the last 4 digits, amount, and merchant.
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleLink}
                disabled={!isValidCard || loading}
                className={`items-center rounded-full py-4 ${
                  isValidCard && !loading ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                <Text
                  className={`text-sm font-bold ${
                    isValidCard && !loading ? 'text-white' : 'text-gray-400'
                  }`}
                  style={{ fontFamily: 'BricolageGrotesque-Bold' }}>
                  {loading ? 'Linking...' : 'Link Card'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppSafeAreaView>
  );
}
