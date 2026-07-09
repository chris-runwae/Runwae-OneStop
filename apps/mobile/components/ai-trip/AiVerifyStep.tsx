import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import { Plus, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type Props = {
  width: number;
  baseTags: string[];
  selectedTags: string[];
  setSelectedTags: (next: string[]) => void;
  adHocTags: string[];
  setAdHocTags: (next: string[]) => void;
};

const AiVerifyStep = ({
  width,
  baseTags,
  selectedTags,
  setSelectedTags,
  adHocTags,
  setAdHocTags,
}: Props) => {
  const dark = useColorScheme() === 'dark';
  const colors = Colors[dark ? 'dark' : 'light'];
  const [draft, setDraft] = useState('');
  const initSeed = useRef(false);

  useEffect(() => {
    if (initSeed.current) return;
    if (baseTags.length === 0) return;
    setSelectedTags(baseTags);
    initSeed.current = true;
  }, [baseTags, setSelectedTags]);

  const toggleBaseTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const addAdHoc = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (adHocTags.includes(trimmed)) {
      setDraft('');
      return;
    }
    setAdHocTags([...adHocTags, trimmed]);
    setDraft('');
  };

  const removeAdHoc = (tag: string) => {
    setAdHocTags(adHocTags.filter((t) => t !== tag));
  };

  return (
    <View style={[styles.container, { width }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.textColors.default }]}>
          We&apos;ll plan with these {'\n'}in mind.
        </Text>
        <Text style={[styles.subtitle, { color: colors.textColors.subtle }]}>
          Tap to remove any that don&apos;t fit this trip, or add new ones.
        </Text>

        {baseTags.length > 0 ? (
          <>
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.textColors.subtle },
              ]}>
              From your profile
            </Text>
            <View style={styles.chipGroup}>
              {baseTags.map((tag) => {
                const on = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    activeOpacity={0.85}
                    onPress={() => toggleBaseTag(tag)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: on
                          ? '#FF1F8C'
                          : dark
                            ? 'rgba(255,255,255,0.05)'
                            : '#F1F3F5',
                        borderColor: on
                          ? '#FF1F8C'
                          : dark
                            ? '#374151'
                            : '#E5E7EB',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: on ? '#fff' : colors.textColors.default,
                        },
                      ]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <Text
            style={[
              styles.empty,
              {
                color: colors.textColors.subtle,
                borderColor: dark ? '#374151' : '#E5E7EB',
              },
            ]}>
            No saved preferences yet. Add a few below to guide this trip.
          </Text>
        )}

        <Text
          style={[
            styles.sectionLabel,
            { color: colors.textColors.subtle, marginTop: 22 },
          ]}>
          Just for this trip
        </Text>

        <View
          style={[
            styles.adHocInputRow,
            {
              backgroundColor: dark ? '#1A1A1A' : '#F9FAFB',
              borderColor: dark ? '#374151' : '#E5E7EB',
            },
          ]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="e.g. coffee, jazz bars, hiking…"
            placeholderTextColor={dark ? '#6B7280' : '#9CA3AF'}
            style={[styles.adHocInput, { color: colors.textColors.default }]}
            onSubmitEditing={addAdHoc}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={addAdHoc}
            disabled={!draft.trim()}
            style={[
              styles.addBtn,
              {
                backgroundColor: '#FF1F8C',
                opacity: draft.trim() ? 1 : 0.4,
              },
            ]}>
            <Plus size={14} color="#fff" strokeWidth={2.5} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {adHocTags.length > 0 ? (
          <View style={[styles.chipGroup, { marginTop: 12 }]}>
            {adHocTags.map((tag) => (
              <Animated.View
                key={tag}
                entering={FadeIn.duration(160)}
                style={[
                  styles.chipRemovable,
                  {
                    backgroundColor: dark ? 'rgba(255,31,140,0.18)' : '#FFF1F8',
                    borderColor: '#FF1F8C',
                  },
                ]}>
                <Text style={[styles.chipText, { color: '#FF1F8C' }]}>
                  {tag}
                </Text>
                <TouchableOpacity onPress={() => removeAdHoc(tag)} hitSlop={6}>
                  <X size={12} color="#FF1F8C" strokeWidth={2.4} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default AiVerifyStep;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: AppFonts.bricolage.extraBold,
    paddingVertical: 12,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: AppFonts.inter.regular,
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
  },
  chipRemovable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontFamily: AppFonts.inter.medium,
  },
  empty: {
    padding: 14,
    fontSize: 12,
    fontFamily: AppFonts.inter.regular,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  adHocInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
  },
  adHocInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
    paddingVertical: 6,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: AppFonts.inter.medium,
  },
});
