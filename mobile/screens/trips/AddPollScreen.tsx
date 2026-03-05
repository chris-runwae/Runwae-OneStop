import {
  View,
  Switch,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Text, TextInput, Spacer } from '@/components';
import { Colors, textStyles } from '@/constants';
import usePollActions, { PollType } from '@/hooks/usePollActions';
import { useAuth } from '@/context/AuthContext';

export default function AddPollScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();

  const { user } = useAuth();
  const { createPoll, isLoading } = usePollActions();

  const [pollTitle, setPollTitle] = useState('');
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
  const [anonymousVoting, setAnonymousVoting] = useState(false);
  const [allowAddingOptions, setAllowAddingOptions] = useState(false);

  const [options, setOptions] = useState<string[]>(['', '']);

  const addOption = () => {
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const handleCreatePoll = async () => {
    const poll = {
      group_id: tripId,
      title: pollTitle,
      type: allowMultipleAnswers
        ? ('multiple_choice' as PollType)
        : ('single_choice' as PollType),
      allow_add_options: allowAddingOptions,
      anonymous_voting: anonymousVoting,
      created_by: user?.id as string,
    };
    const pollOptions = options
      .filter((o) => o.trim())
      .map((label) => ({ label, created_by: user?.id as string }));
    try {
      await createPoll(poll, pollOptions);
    } catch (error) {
      console.error('Failed to create poll:', error);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{
        paddingHorizontal: 16,
        flex: 1,
        backgroundColor: Colors.light.background,
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
          borderBottomColor: Colors.light.borderDefault,
        }}>
        <Pressable
          hitSlop={{ top: 30, bottom: 30, left: 30, right: 60 }}
          onPress={() => {
            router.dismiss();
          }}
          style={{
            position: 'absolute',
            left: 0,
            top: 24,
          }}>
          <Text
            style={{
              fontSize: 14,
              textAlign: 'left',
            }}>
            Close
          </Text>
        </Pressable>
        <Text
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            flex: 1,
          }}>
          Add Poll
        </Text>
      </View>
      <Spacer size={24} vertical />

      <TextInput
        label="Ask a question"
        isRequired
        requiredType="asterisk"
        placeholder="What would you like to know?"
        labelStyle={styles.labelStyle} //TODO: This should be Inter font
        style={styles.inputStyle}
        value={pollTitle}
        onChangeText={(text) => setPollTitle(text)}
      />

      <Spacer size={24} vertical />
      <Text style={styles.labelStyle}>
        <Text style={{ color: 'red' }}>*</Text> Poll Options
      </Text>
      {options.map((option, index) => (
        <>
          <View key={index} style={styles.inputContainer}>
            <TextInput
              placeholder={`Option ${index + 1}`}
              labelStyle={styles.labelStyle}
              style={styles.inputStyle}
              value={option}
              onChangeText={(text) => updateOption(index, text)}
              containerStyle={{
                flex: 1,
                width: '100%',
              }}
            />

            {options.length > 2 && (
              <Pressable
                onPress={() => removeOption(index)}
                style={styles.removeButton}>
                <X size={16} color={Colors.light.textHeading} />
              </Pressable>
            )}
          </View>
          {index < options.length - 1 && <Spacer size={12} vertical />}
        </>
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
        onPress={handleCreatePoll}
        disabled={isLoading}
        style={styles.button}>
        {isLoading ? (
          <ActivityIndicator size={24} color={Colors.light.textHeading} />
        ) : (
          <Text style={styles.buttonText}>Create Poll</Text>
        )}
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  pollSettingsHeading: {
    ...textStyles.textHeading16,
    color: Colors.light.textHeading,
    textAlign: 'left',
  },
  frameParent: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
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
    color: Colors.light.textHeading,
    textAlign: 'left',
  },
  switchLabelDescription: {
    ...textStyles.textBody12,
    color: Colors.light.textBody,
    textAlign: 'left',
  },
  labelStyle: {
    ...textStyles.textHeading16,
    fontSize: 14,
    color: Colors.light.textHeading,
    marginBottom: 4,
  },
  inputStyle: {
    fontSize: 14,
    textAlign: 'left',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderDefault,
    backgroundColor: Colors.light.containerSubtle,
    borderRadius: 8,
  },

  button: {
    backgroundColor: '#ffdde6',
    borderStyle: 'solid',
    borderColor: '#ffdde6',
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

  add: {
    height: 16,
    width: 16,
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter-Regular',
    color: '#ff2e92',
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
