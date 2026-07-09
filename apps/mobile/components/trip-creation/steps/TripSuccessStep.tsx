import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import { Check, Share2 } from 'lucide-react-native';
import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, { Easing, ZoomIn } from 'react-native-reanimated';

type Props = {
  width: number;
  destination: string;
  title: string;
  onViewTrip: () => void;
  onShare: () => void;
};

const STREAMER_COLORS = [
  '#FF1F8C',
  '#FFB13B',
  '#7B5EFF',
  '#00C3A0',
  '#FFE066',
  '#FF6FB1',
];

const STREAMERS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  color: STREAMER_COLORS[i % STREAMER_COLORS.length],
  left: `${5 + i * 8 + (i % 3) * 4}%`,
  rotate: (i % 2 === 0 ? -1 : 1) * (10 + ((i * 7) % 28)),
  delay: i * 40,
}));

const TripSuccessStep = ({
  width,
  destination,
  title,
  onViewTrip,
  onShare,
}: Props) => {
  const dark = useColorScheme() === 'dark';
  const colors = Colors[dark ? 'dark' : 'light'];

  return (
    <View style={[styles.container, { width }]}>
      <Animated.View
        entering={ZoomIn.duration(360).easing(Easing.out(Easing.back(1.6)))}
        style={[styles.checkCircle, { backgroundColor: '#FF1F8C' }]}>
        <Check size={36} color="#fff" strokeWidth={3} />
      </Animated.View>

      <Text style={[styles.title, { color: colors.textColors.default }]}>
        Trip created
      </Text>
      <Text style={[styles.subtitle, { color: colors.textColors.subtle }]}>
        {title}
      </Text>
      <Text style={[styles.destination, { color: colors.textColors.subtle }]}>
        Off to {destination} ✈️
      </Text>

      <View style={styles.ctaRow}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onViewTrip}
          style={[styles.primaryBtn, { backgroundColor: '#FF1F8C' }]}>
          <Text style={styles.primaryBtnText}>View trip</Text>
        </TouchableOpacity>

        <Pressable
          onPress={onShare}
          style={[
            styles.shareBtn,
            { borderColor: dark ? '#374151' : '#E5E7EB' },
          ]}>
          <Share2 size={16} color={colors.textColors.default} />
          <Text
            style={[styles.shareBtnText, { color: colors.textColors.default }]}>
            Share
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TripSuccessStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: '#FF1F8C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontFamily: AppFonts.bricolage.semiBold,
    fontSize: 24,
    paddingVertical: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
    textAlign: 'center',
  },
  destination: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
    marginTop: 4,
    textAlign: 'center',
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
    width: '100%',
    paddingHorizontal: 8,
  },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 99,
    borderWidth: 1,
  },
  shareBtnText: {
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
  },
});
