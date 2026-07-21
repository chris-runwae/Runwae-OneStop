import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import { api } from '@runwae/convex/convex/_generated/api';
import { useAction } from 'convex/react';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Search, Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';

type Photo = {
  id: string;
  url: string;
  thumbUrl: string;
  altDescription: string | null;
  photographerName: string;
  attributionUrl: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onPickLocal: (uri: string) => void;
  onPickUnsplash: (url: string) => void;
  seedQuery: string;
  selectedUrl: string | null;
};

const CoverImagePicker = ({
  visible,
  onClose,
  onPickLocal,
  onPickUnsplash,
  seedQuery,
  selectedUrl,
}: Props) => {
  const dark = useColorScheme() === 'dark';
  const colors = Colors[dark ? 'dark' : 'light'];
  const search = useAction(api.unsplash.searchPhotos);
  const trackDownload = useAction(api.unsplash.trackDownload);

  const [tab, setTab] = useState<'unsplash' | 'device'>('unsplash');
  const [query, setQuery] = useState(seedQuery);
  const [touched, setTouched] = useState(false);
  const [results, setResults] = useState<Photo[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (!touched) setQuery(seedQuery);
  }, [visible, seedQuery, touched]);

  useEffect(() => {
    if (!visible || tab !== 'unsplash') return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    search({ query: q, perPage: 12, orientation: 'landscape' })
      .then((items) => {
        if (cancelled) return;
        setResults(items as Photo[]);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, tab, query, search]);

  const handlePickPhoto = (p: Photo) => {
    onPickUnsplash(p.url);
    void trackDownload({ photoId: p.id });
    onClose();
  };

  const handlePickFromDevice = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [2, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onPickLocal(result.assets[0].uri);
      onClose();
    }
  };

  const skeletons = useMemo(() => [0, 1, 2, 3, 4, 5], []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      {visible ? (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          <Animated.View
            entering={SlideInDown.duration(280).damping(18)}
            style={[
              styles.sheet,
              { backgroundColor: dark ? '#1C1C1E' : '#fff' },
            ]}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  { color: colors.textColors.default },
                ]}>
                Cover image
              </Text>
              <Pressable hitSlop={10} onPress={onClose}>
                <X size={20} color={colors.textColors.subtle} />
              </Pressable>
            </View>

            <View style={styles.tabs}>
              {(['unsplash', 'device'] as const).map((t) => {
                const active = tab === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    style={[
                      styles.tab,
                      active && { backgroundColor: dark ? '#2C2C2E' : '#FFF1F8' },
                      active && {
                        borderColor: '#FF1F8C',
                      },
                      !active && {
                        borderColor: dark ? '#374151' : '#E5E7EB',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.tabLabel,
                        {
                          color: active
                            ? '#FF1F8C'
                            : colors.textColors.default,
                        },
                      ]}>
                      {t === 'unsplash' ? 'Unsplash' : 'From device'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {tab === 'unsplash' ? (
              <View style={{ flex: 1 }}>
                <View
                  style={[
                    styles.searchRow,
                    {
                      backgroundColor: dark ? '#2C2C2E' : '#F9FAFB',
                      borderColor: dark ? '#374151' : '#E5E7EB',
                    },
                  ]}>
                  <Search size={14} color={colors.textColors.subtle} />
                  <TextInput
                    value={query}
                    onChangeText={(v) => {
                      setTouched(true);
                      setQuery(v);
                    }}
                    placeholder="Search Unsplash for a cover…"
                    placeholderTextColor={dark ? '#6B7280' : '#9CA3AF'}
                    style={[
                      styles.searchInput,
                      { color: colors.textColors.default },
                    ]}
                  />
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.gridContent}>
                  {loading ? (
                    <View style={styles.grid}>
                      {skeletons.map((i) => (
                        <View
                          key={i}
                          style={[
                            styles.cell,
                            {
                              backgroundColor: dark ? '#2C2C2E' : '#F0F0F0',
                            },
                          ]}
                        />
                      ))}
                    </View>
                  ) : results === null || results.length === 0 ? (
                    <View
                      style={[
                        styles.empty,
                        { borderColor: dark ? '#374151' : '#E5E7EB' },
                      ]}>
                      <Sparkles
                        size={16}
                        color={colors.textColors.subtle}
                        style={{ marginBottom: 4 }}
                      />
                      <Text
                        style={{
                          color: colors.textColors.subtle,
                          fontSize: 12,
                          fontFamily: AppFonts.inter.regular,
                        }}>
                        {query.trim()
                          ? 'No photos for that search.'
                          : 'Type a destination to see photos.'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.grid}>
                      {results.map((p) => {
                        const on = selectedUrl === p.url;
                        return (
                          <TouchableOpacity
                            key={p.id}
                            activeOpacity={0.85}
                            onPress={() => handlePickPhoto(p)}
                            style={[
                              styles.cell,
                              on && {
                                borderColor: '#FF1F8C',
                                borderWidth: 2,
                              },
                            ]}>
                            <Image
                              source={{ uri: p.thumbUrl }}
                              style={StyleSheet.absoluteFill}
                              contentFit="cover"
                            />
                            {on ? (
                              <View style={styles.checkBadge}>
                                <Text style={styles.checkBadgeText}>✓</Text>
                              </View>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                  {results && results.length > 0 ? (
                    <Text
                      style={[
                        styles.attribution,
                        { color: colors.textColors.subtle },
                      ]}>
                      Photos from Unsplash. Photographer credit is preserved on
                      the trip page.
                    </Text>
                  ) : null}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.deviceTab}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePickFromDevice}
                  style={[
                    styles.devicePickBtn,
                    { backgroundColor: '#FF1F8C' },
                  ]}>
                  <Text style={styles.devicePickLabel}>
                    Choose from camera roll
                  </Text>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.deviceHint,
                    { color: colors.textColors.subtle },
                  ]}>
                  PNG or JPG. Square or 2:1 ratio looks best.
                </Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      ) : null}
    </Modal>
  );
};

export default CoverImagePicker;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    height: '78%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    alignSelf: 'center',
    marginBottom: 12,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontFamily: AppFonts.bricolage.semiBold,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: AppFonts.inter.medium,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: AppFonts.inter.regular,
    padding: 0,
  },
  gridContent: {
    paddingBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    width: '32.5%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#EEE',
  },
  checkBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF1F8C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  empty: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  attribution: {
    fontSize: 10.5,
    marginTop: 12,
    fontFamily: AppFonts.inter.regular,
  },
  deviceTab: {
    paddingTop: 24,
    alignItems: 'center',
    gap: 12,
  },
  devicePickBtn: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 99,
  },
  devicePickLabel: {
    color: '#fff',
    fontSize: 14,
    fontFamily: AppFonts.inter.medium,
  },
  deviceHint: {
    fontSize: 12,
    fontFamily: AppFonts.inter.regular,
  },
});
