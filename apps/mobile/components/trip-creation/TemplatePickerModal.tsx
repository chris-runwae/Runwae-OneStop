import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import { useQuery } from 'convex/react';

import { Colors } from '@/constants';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Id } from '@runwae/convex/convex/_generated/dataModel';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (templateId: Id<'itinerary_templates'>) => void | Promise<void>;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800';

export default function TemplatePickerModal({
  isVisible,
  onClose,
  onSelect,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const dark = colorScheme === 'dark';

  const templates = useQuery(
    api.itinerary.listTemplates,
    isVisible ? { limit: 24 } : 'skip',
  );
  const loading = isVisible && templates === undefined;

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.backgroundColors.default },
        ]}>
        <View style={styles.handleBar} />

        <View style={styles.header}>
          <Text
            style={[styles.headerTitle, { color: colors.textColors.default }]}>
            Pick a template
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={12}>
            <Text
              style={[styles.closeText, { color: colors.textColors.subtle }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#FF1F8C" />
          </View>
        ) : !templates || templates.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: colors.textColors.subtle, textAlign: 'center' }}>
              No templates available yet — check back soon.
            </Text>
          </View>
        ) : (
          <FlatList
            data={templates}
            keyExtractor={(t) => t._id as unknown as string}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelect(item._id)}
                style={[
                  styles.row,
                  {
                    backgroundColor: dark ? '#1F1F1F' : '#fff',
                    borderColor: dark ? '#2c2c2e' : '#E5E7EB',
                  },
                ]}>
                <Image
                  source={{ uri: item.coverImageUrl ?? FALLBACK_IMAGE }}
                  style={styles.thumbnail}
                />
                <View style={styles.rowText}>
                  <Text
                    style={[
                      styles.title,
                      { color: colors.textColors.default },
                    ]}
                    numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text
                    style={{ color: colors.textColors.subtle, fontSize: 12 }}
                    numberOfLines={1}>
                    {item.durationDays} day{item.durationDays === 1 ? '' : 's'}
                    {item.category ? ` · ${item.category}` : ''}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  closeText: { fontSize: 14 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderWidth: 1,
    borderRadius: 14,
  },
  thumbnail: { width: 60, height: 60, borderRadius: 10 },
  rowText: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: '600' },
});
