import {
  View,
  Switch,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Text, Spacer } from '@/components';
import TextInput from '@/components/ui/TextInput';
import { Colors, textStyles } from '@/constants';
import usePollActions, { PollType } from '@/hooks/usePollActions';
import { useAuth } from '@/context/AuthContext';

type OptionState = { id?: string; label: string };

export default function AddPollScreen() {
  const { tripId, pollId } = useLocalSearchParams<{
    tripId: string;
    pollId?: string;
  }>();
  const isEditMode = !!pollId;
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { user } = useAuth();
  const { createPoll, updatePoll, fetchPollById, isLoading } = usePollActions();

  const [pollTitle, setPollTitle] = useState('');
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [anonymousVoting, setAnonymousVoting] = useState(false);
  const [allowAddingOptions, setAllowAddingOptions] = useState(false);
  const [options, setOptions] = useState<OptionState[]>([
    { label: '' },
    { label: '' },
  ]);
  const [deletedOptionIds, setDeletedOptionIds] = useState<string[]>([]);

  useEffect(() => {
    if (!pollId) return;
    fetchPollById(pollId).then((poll) => {
      setPollTitle(poll.title);
      setAllowMultipleAnswers(poll.type === 'multiple_choice');
      setAnonymousVoting(poll.anonymous_voting ?? false);
      setAllowAddingOptions(poll.allow_add_options ?? false);
      setOptions(poll.poll_options.map((o) => ({ id: o.id, label: o.label })));
    });
  }, [pollId]);

  const addOption = () => {
    setOptions((prev) => [...prev, { label: '' }]);
  };

  const removeOption = (index: number) => {
    const option = options[index];
    if (option.id) {
      setDeletedOptionIds((prev) => [...prev, option.id!]);
    }
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, label: value } : opt))
    );
  };

  const handleSubmit = async () => {
    const pollData = {
      title: pollTitle,
      type: allowMultipleAnswers
        ? ('multiple_choice' as PollType)
        : ('single_choice' as PollType),
      allow_add_options: allowAddingOptions,
      anonymous_voting: anonymousVoting,
    };

    try {
      if (isEditMode) {
        await updatePoll(
          pollId,
          pollData,
          options
            .filter((o) => o.label.trim())
            .map((o) => ({ ...o, created_by: user?.id as string })),
          deletedOptionIds
        );
      } else {
        await createPoll(
          { ...pollData, group_id: tripId, created_by: user?.id as string },
          options
            .filter((o) => o.label.trim())
            .map((o) => ({ label: o.label, created_by: user?.id as string }))
        );
      }
      router.dismiss();
    } catch (error) {
      console.error(
        `Failed to ${isEditMode ? 'update' : 'create'} poll:`,
        error
      );
      alert(
        `Failed to ${isEditMode ? 'update' : 'create'} poll. Please try again.`
      );
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    pollSettingsHeading: {
      ...textStyles.textHeading16,
      color: colors.textColors.default,
      textAlign: 'left',
    },
    frameParent: {
      backgroundColor: colors.backgroundColors.subtle,
      borderColor: colors.borderColors.subtle,
      borderWidth: 1,
      flex: 1,
      padding: 10,
      width: '100%',
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
      borderRadius: 8,
    },
    switchLabelContainer: {
      gap: 4,
    },
    switchLabelHeading: {
      ...textStyles.textHeading16,
      fontSize: 14,
      color: colors.textColors.default,
      textAlign: 'left',
    },
    switchLabelDescription: {
      ...textStyles.textBody12,
      color: colors.textColors.default,
      textAlign: 'left',
    },
    labelStyle: {
      ...textStyles.textHeading16,
      fontSize: 14,
      color: colors.textColors.default,
      marginBottom: 4,
    },
    inputStyle: {
      fontSize: 14,
      textAlign: 'left',
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.borderColors.subtle,
      backgroundColor: colors.backgroundColors.subtle,
      borderRadius: 8,
    },
    button: {
      backgroundColor: colors.primaryColors.default,
      borderStyle: 'solid',
      borderColor: colors.primaryColors.border,
      borderWidth: 1,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 8,
      width: '100%',
      borderRadius: 8,
    },
    buttonText: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Inter-Regular',
      color: colors.white,
      textAlign: 'left',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    removeButton: {
      padding: 8,
      borderRadius: 8,
    },
  });

  return (
    <KeyboardAwareScrollView
      style={{
        paddingHorizontal: 16,
        flex: 1,
        backgroundColor: colors.backgroundColors.default,
        height: '100%',
      }}
      contentContainerStyle={{ flexGrow: 1 }}
      bottomOffset={100}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 24,
          paddingBottom: 8,
          borderBottomWidth: 2,
          borderBottomColor: colors.borderColors.subtle,
        }}>
        <Pressable
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => router.dismiss()}
          style={{ width: 60 }}>
          <Text style={{ fontSize: 14 }}>Close</Text>
        </Pressable>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            flex: 1,
          }}>
          {isEditMode ? 'Edit Poll' : 'Add Poll'}
        </Text>
        <View style={{ width: 60 }} />
      </View>
      <Spacer size={24} vertical />

      <TextInput
        label="Ask a question"
        isRequired
        requiredType="asterisk"
        placeholder="What would you like to know?"
        labelStyle={styles.labelStyle}
        style={styles.inputStyle}
        value={pollTitle}
        onChangeText={(text) => setPollTitle(text)}
      />

      <Spacer size={24} vertical />
      <Text style={styles.labelStyle}>
        <Text style={{ color: 'red' }}>*</Text> Poll Options
      </Text>
      {options.map((option, index) => (
        <React.Fragment key={option.id ?? `new-${index}`}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder={`Option ${index + 1}`}
              labelStyle={styles.labelStyle}
              style={styles.inputStyle}
              value={option.label}
              onChangeText={(text) => updateOption(index, text)}
              containerStyle={{ flex: 1, width: '100%' }}
            />
            {options.length > 2 && (
              <Pressable
                onPress={() => removeOption(index)}
                style={styles.removeButton}>
                <X size={16} color={colors.textColors.default} />
              </Pressable>
            )}
          </View>
          {index < options.length - 1 && <Spacer size={12} vertical />}
        </React.Fragment>
      ))}

      <Spacer size={24} vertical />
      <Pressable onPress={addOption} style={styles.button}>
        <Text style={styles.buttonText}>Add another option</Text>
      </Pressable>

      <Spacer size={24} vertical />
      <View>
        <Text style={styles.pollSettingsHeading}>Poll Settings</Text>
        <Spacer size={12} vertical />
        <View style={styles.frameParent}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabelHeading}>
              Allow multiple answers
            </Text>
          </View>
          <Switch
            value={allowMultipleAnswers}
            onValueChange={() => setAllowMultipleAnswers(!allowMultipleAnswers)}
          />
        </View>
        <Spacer size={12} vertical />
        <View style={styles.frameParent}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabelHeading}>
              Allow anonymous voting
            </Text>
            <Text style={styles.switchLabelDescription}>
              People&apos;s votes will remain undisclosed
            </Text>
          </View>
          <Switch
            value={anonymousVoting}
            onValueChange={() => setAnonymousVoting(!anonymousVoting)}
          />
        </View>
        <Spacer size={12} vertical />
        <View style={styles.frameParent}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchLabelHeading}>Allow adding options</Text>
            <Text style={styles.switchLabelDescription}>
              Participants can add options to the poll
            </Text>
          </View>
          <Switch
            value={allowAddingOptions}
            onValueChange={() => setAllowAddingOptions(!allowAddingOptions)}
          />
        </View>
      </View>

      <Spacer size={24} vertical />
      <Pressable
        onPress={handleSubmit}
        disabled={isLoading}
        style={styles.button}>
        {isLoading ? (
          <ActivityIndicator size={24} color={colors.textColors.default} />
        ) : (
          <Text style={styles.buttonText}>
            {isEditMode ? 'Update Poll' : 'Create Poll'}
          </Text>
        )}
      </Pressable>
    </KeyboardAwareScrollView>
  );
}
