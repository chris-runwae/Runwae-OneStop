import { useTheme } from '@react-navigation/native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CreateStepHeaderProps {
  currentStep: number;
  totalSteps:  number;
  onBack?:     () => void;
}

const RADIUS       = 18;
const STROKE_WIDTH = 3;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE          = (RADIUS + STROKE_WIDTH) * 2;

export default function CreateStepHeader({
  currentStep,
  totalSteps,
  onBack,
}: CreateStepHeaderProps) {
  const { dark } = useTheme();
  const progress        = currentStep / totalSteps;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.backButton, { backgroundColor: dark ? '#2c2c2e' : '#f3f4f6' }]}
        onPress={onBack ?? (() => router.back())}
      >
        <ArrowLeft size={15} color={dark ? '#ffffff' : '#374151'} strokeWidth={1.8} />
      </TouchableOpacity>

      <View style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            stroke={dark ? '#2c2c2e' : '#e5e7eb'}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            stroke="#FF1F8C"
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={styles.progressLabel}>
          <Text style={styles.progressCurrent}>{currentStep}</Text>
          <Text style={styles.progressTotal}>/{totalSteps}</Text>
        </View>
      </View>

      {/* Spacer to balance the row */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   32,
  },
  backButton: {
    width:          40,
    height:         40,
    borderRadius:   20,
    alignItems:     'center',
    justifyContent: 'center',
  },
  progressLabel: {
    position:      'absolute',
    flexDirection: 'row',
    alignItems:    'baseline',
  },
  progressCurrent: {
    color:      '#FF1F8C',
    fontSize:   13,
    fontWeight: '600',
  },
  progressTotal: {
    color:    '#9ca3af',
    fontSize: 10,
  },
  spacer: {
    width: 40,
  },
});
