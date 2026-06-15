import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import Svg, { Path } from 'react-native-svg';

import type { AuthMethod } from '@/hooks/useAuth';

interface Props {
  onGoogle: () => void;
  onApple: () => void;
  loading: 'google' | 'apple' | null;
  disabled?: boolean;
  // Used to render a small "Last used" badge over whichever button matches.
  lastAuthMethod?: AuthMethod | null;
}

// Inline 4-color Google "G". Inline SVG works offline and avoids depending on
// expo-image's flaky remote-SVG support.
export function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.09-1.79 2.73v2.27h2.9c1.7-1.57 2.69-3.87 2.69-6.64z"
      />
      <Path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.27c-.81.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.97v2.34A9 9 0 0 0 9 18z"
      />
      <Path
        fill="#FBBC05"
        d="M3.95 10.69A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.16.29-1.69V4.97H.97A9 9 0 0 0 0 9c0 1.45.35 2.83.97 4.03l2.98-2.34z"
      />
      <Path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .97 4.97l2.98 2.34C4.66 5.18 6.65 3.58 9 3.58z"
      />
    </Svg>
  );
}

// Apple HIG: in dark mode the canonical button flips to a white surface with a
// black logo, so the logo's fill follows the foreground color we pick below.
export function AppleLogo({
  size = 18,
  color = '#fff',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 384 512">
      <Path
        fill={color}
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"
      />
    </Svg>
  );
}

export function SocialAuthButtons({
  onGoogle,
  onApple,
  loading,
  disabled,
  lastAuthMethod,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const showApple = Platform.OS === 'ios';
  const isBusy = loading !== null;

  // Apple: black-on-white in dark mode (HIG §Sign In with Apple), black-on-
  // white-stays-black in light. Google: keep a single neutral surface that
  // contrasts with the screen background in either mode.
  const appleBg = isDark ? '#fff' : '#000';
  const appleFg = isDark ? '#000' : '#fff';
  const googleBg = isDark ? '#1F2937' : '#fff';
  const googleFg = isDark ? '#F9FAFB' : '#111827';
  const googleBorder = isDark ? '#374151' : '#E5E7EB';
  const dividerLine = isDark ? '#374151' : '#E5E7EB';
  const dividerText = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <View>
      <View style={styles.dividerRow}>
        <View style={[styles.dividerLine, { backgroundColor: dividerLine }]} />
        <Text style={[styles.dividerText, { color: dividerText }]}>
          or continue with
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: dividerLine }]} />
      </View>

      <View style={styles.row}>
        <View style={styles.buttonWrap}>
          {lastAuthMethod === 'google' && <LastUsedBadge isDark={isDark} />}
          <TouchableOpacity
            onPress={onGoogle}
            disabled={isBusy || disabled}
            style={[
              styles.button,
              {
                backgroundColor: googleBg,
                borderColor: googleBorder,
                borderWidth: 1,
              },
            ]}
            activeOpacity={0.85}>
            {loading === 'google' ? (
              <ActivityIndicator size="small" color={googleFg} />
            ) : (
              <>
                <GoogleLogo />
                <Text style={[styles.label, { color: googleFg }]}>
                  Continue with Google
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {showApple && (
          <View style={styles.buttonWrap}>
            {lastAuthMethod === 'apple' && <LastUsedBadge isDark={isDark} />}
            <TouchableOpacity
              onPress={onApple}
              disabled={isBusy || disabled}
              style={[styles.button, { backgroundColor: appleBg }]}
              activeOpacity={0.85}>
              {loading === 'apple' ? (
                <ActivityIndicator size="small" color={appleFg} />
              ) : (
                <>
                  <AppleLogo color={appleFg} />
                  <Text style={[styles.label, { color: appleFg }]}>
                    Continue with Apple
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function LastUsedBadge({ isDark }: { isDark: boolean }) {
  return (
    <View style={styles.lastUsedBadgeWrap} pointerEvents="none">
      <View
        style={[
          styles.lastUsedBadge,
          { backgroundColor: isDark ? '#F9FAFB' : '#111' },
        ]}>
        <Text
          style={[
            styles.lastUsedBadgeText,
            { color: isDark ? '#111' : '#fff' },
          ]}>
          Last used
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    gap: 10,
  },
  buttonWrap: {
    position: 'relative',
  },
  button: {
    height: 45,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
  },
  lastUsedBadgeWrap: {
    position: 'absolute',
    top: -10,
    right: 12,
    zIndex: 10,
  },
  lastUsedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  lastUsedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
