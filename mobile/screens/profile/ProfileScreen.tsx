import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { CameraIcon, PlusIcon } from 'lucide-react-native';

import { useAuth } from "@/context/AuthContext";
import { Text, ScreenContainer, Spacer } from "@/components";
import { Colors, textStyles } from "@/constants";

export default function ProfileScreen() {
  const { user } = useAuth();
  console.log(user);

  return (
    <ScreenContainer scrollView={true} >
      <Text style={styles.title}>Profile</Text>

      <Spacer size={20} vertical />
      <View style={styles.profileInfoContainer}>
        <View style={styles.profileImageContainer}>
          {user?.profileImage ? (
            <Image
              cachePolicy={"none"}
              source={{ uri: user?.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <PlusIcon size={24} color={Colors.light.iconDefault} />
            </View>
          )}
          <TouchableOpacity style={styles.editButton}>
            <CameraIcon size={16} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        <Spacer size={12} vertical />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: {
    ...textStyles.textHeading20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.borderDefault,
  },
  profileInfoContainer: {
    alignItems: "center",
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.borderDefault,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    backgroundColor:  Colors.light.borderDefault,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: Colors.light.iconDefault,
    borderStyle: "dashed",
  },
  placeholderText: {
    ...textStyles.textHeading20,
    fontSize: 40,
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    borderRadius: 24,
    padding: 10,
  },

  name: {
    ...textStyles.textHeading16,
  },
  username: {
    ...textStyles.textBody12,
  },
});