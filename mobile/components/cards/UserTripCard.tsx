import { View, Text, Pressable, ImageBackground, StyleSheet } from "react-native";
import React, { useMemo } from "react";
import { router } from "expo-router";

import type { Trip } from "@/hooks/useTripActions";
import { useAuth } from "@/context/AuthContext";
import { textStyles, Colors } from "@/constants";
import { AvatarGroup } from "../ui/AvatarGroup";
import Spacer from "../utils/Spacer";
import { LinearGradient } from "expo-linear-gradient";

type UserTripCardProps = {
  trip: Trip;
};

export default function UserTripCard({ trip }: UserTripCardProps) {
  const { user } = useAuth();

  const role = useMemo(() => {
    let userRole = trip.group_members?.find(member => member.user_id === user?.id)?.role ?? 'Member';
    if (userRole === 'owner') return 'Leader';
    if (userRole === 'admin') return 'Co-Leader';
    return 'Member';
  }, [trip.group_members, user?.id]);

  return (
    <Pressable onPress={() => router.push(`/(tabs)/(trips)/${trip.id}`)} style={styles.container}>
      <ImageBackground source={trip.cover_image_url ? { uri: trip.cover_image_url } : undefined} style={styles.image} resizeMode="cover">
        <View style={styles.content}>
          <View style={styles.roleContainer}>
            <Text style={styles.roleText}>{role}</Text>
          </View>

          <LinearGradient colors={['#87868600', '#727272B3', '#686868']} style={styles.blurView}>
            <View style={styles.infoContainer}>
              <View>
                <Text style={styles.title}>{trip.name}</Text>
                <Spacer size={4} vertical />
                {trip.trip_details?.destination_label && (
                  <Text style={styles.subtext}>📍 {trip.trip_details?.destination_label}</Text>
                )}
              </View>
              <AvatarGroup members={trip.group_members ?? []} size={24} overlap={6}/>
            </View>

            <Spacer size={16} vertical />
            <Text style={styles.subtext}>Feb 21 - Feb 28 2026 | 3 days | 12 items</Text>
          </LinearGradient>
        </View>
      </ImageBackground>  
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    backgroundColor: '#00000073',
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    ...textStyles.textHeading16,
    color: Colors.light.background,
  },
  subtext: {
    ...textStyles.textBody12,
    color: Colors.light.background,
  },

  roleContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#000000A6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    ...textStyles.textBody12,
    fontSize: 12,
    color: Colors.light.background,
  },

  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  blurView: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
