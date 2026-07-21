import { Text } from '@/components';
import { AppFonts, Colors } from '@/constants';
import { api } from '@runwae/convex/convex/_generated/api';
import type { Doc, Id } from '@runwae/convex/convex/_generated/dataModel';
import { useTheme } from "expo-router/react-navigation";
import { useMutation } from 'convex/react';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  item: Doc<'itinerary_items'> | null;
  onClose: () => void;
}

// Lightweight edit sheet. Covers the fields users actually tweak on
// trip-from-link generated items (title / location / time / price /
// notes). For deeper edits — image swap, day move, type change — we'd
// retrofit the existing AddItineraryItemSheet (currently 823 lines, so
// staying out of it for this change).
export default function EditItineraryItemSheet({
  visible,
  item,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const { dark } = useTheme();
  const colors = Colors[dark ? 'dark' : 'light'];
  const updateItem = useMutation(api.itinerary.updateItem);

  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [priceStr, setPriceStr] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible || !item) return;
    setTitle(item.title);
    setLocationName(item.locationName ?? '');
    setStartTime(item.startTime ?? '');
    setPriceStr(item.price !== undefined ? String(item.price) : '');
    setNotes(item.notes ?? '');
  }, [visible, item]);

  const handleSave = async () => {
    if (!item || submitting) return;
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Title required', 'Give this item a name.');
      return;
    }
    setSubmitting(true);
    try {
      const priceNum = priceStr.trim() ? Number(priceStr) : undefined;
      await updateItem({
        itemId: item._id as Id<'itinerary_items'>,
        title: trimmed,
        locationName: locationName.trim() || undefined,
        startTime: startTime.trim() || undefined,
        price: priceNum !== undefined && !Number.isNaN(priceNum) ? priceNum : undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      Alert.alert(
        'Couldn’t save',
        err instanceof Error ? err.message : 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.backgroundColors.default,
              paddingBottom: insets.bottom + 16,
            },
          ]}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={20} color={colors.textColors.default} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: colors.textColors.default }]}>
              Edit item
            </Text>
            <Pressable
              onPress={handleSave}
              disabled={submitting}
              hitSlop={10}>
              <Text
                style={[
                  styles.saveBtn,
                  { opacity: submitting ? 0.5 : 1 },
                ]}>
                {submitting ? 'Saving…' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 480 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 16, gap: 14 }}>
            <Field
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Sunset rooftop dinner"
              colors={colors}
              dark={dark}
            />
            <Field
              label="Location"
              value={locationName}
              onChangeText={setLocationName}
              placeholder="Venue or area"
              colors={colors}
              dark={dark}
            />
            <Field
              label="Start time"
              value={startTime}
              onChangeText={setStartTime}
              placeholder="HH:MM (24h)"
              autoCapitalize="none"
              keyboardType="numbers-and-punctuation"
              colors={colors}
              dark={dark}
            />
            <Field
              label="Price"
              value={priceStr}
              onChangeText={setPriceStr}
              placeholder="0"
              keyboardType="decimal-pad"
              colors={colors}
              dark={dark}
            />
            <Field
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything to remember"
              multiline
              colors={colors}
              dark={dark}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (s: string) => void;
  placeholder?: string;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?:
    | 'default'
    | 'numeric'
    | 'decimal-pad'
    | 'numbers-and-punctuation';
  colors: typeof Colors.light;
  dark: boolean;
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  autoCapitalize = 'sentences',
  keyboardType,
  colors,
  dark,
}: FieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.fieldLabel, { color: colors.textColors.subtle }]}>
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={dark ? '#555' : '#999'}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        selectionColor="#FF1F8C"
        style={[
          styles.input,
          {
            color: colors.textColors.default,
            backgroundColor: dark ? '#1A1A1A' : '#F5F5F5',
            borderColor: dark ? '#333' : '#E5E5E5',
            minHeight: multiline ? 80 : 44,
            textAlignVertical: multiline ? 'top' : 'center',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 16, fontFamily: AppFonts.bricolage.semiBold },
  saveBtn: {
    fontSize: 14,
    fontFamily: AppFonts.inter.semiBold,
    color: '#FF1F8C',
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: AppFonts.inter.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: AppFonts.inter.regular,
  },
});
