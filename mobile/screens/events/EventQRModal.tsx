// screens/events/EventQRModal.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { EventsService } from '@/services/events.service';
import type { Event } from '@/types/events';

export default function EventQRModal() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const qrRef = React.useRef<View>(null);

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await EventsService.getEventById(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventUrl = `https://runwae.com/events/${eventId}`;
  const deepLink = `runwae://events/${eventId}`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Scan this QR code to view event: ${event?.name}\n\n${eventUrl}`,
        url: eventUrl,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleSaveImage = async () => {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access camera roll is required!');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Capture QR code as image
      if (qrRef.current) {
        const uri = await captureRef(qrRef, {
          format: 'png',
          quality: 1,
        });

        // Save to camera roll
        await MediaLibrary.createAssetAsync(uri);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alert('QR code saved to camera roll!');
      }
    } catch (error) {
      console.error('Failed to save QR code:', error);
      alert('Failed to save QR code');
    }
  };

  if (loading || !event) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => router.dismiss()}
        style={styles.backdrop}
      >
        <BlurView intensity={30} style={StyleSheet.absoluteFill} />
      </TouchableOpacity>

      {/* Modal Content */}
      <Animated.View entering={ZoomIn.springify()} style={styles.modalContent}>
        {/* Close Button */}
        <TouchableOpacity onPress={() => router.dismiss()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#666" />
        </TouchableOpacity>

        {/* QR Code Container */}
        <View ref={qrRef} style={styles.qrContainer}>
          <Animated.View entering={FadeIn.delay(200)} style={styles.qrCodeWrapper}>
            <QRCode
              value={deepLink}
              size={220}
              backgroundColor="white"
              color="black"
              logo={require('@/assets/images/icon.png')} // Optional: Add your app logo
              logoSize={40}
              logoBackgroundColor="white"
              logoBorderRadius={8}
            />
          </Animated.View>

          {/* Event Info */}
          <View style={styles.eventInfo}>
            <Text style={styles.eventName} numberOfLines={2}>
              {event.name}
            </Text>
            <Text style={styles.scanText}>Scan to view event details</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleSaveImage} style={styles.actionButton}>
            <Ionicons name="download-outline" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Save QR Code</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>
          Share this QR code at your event. People can scan it to view details and attend.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  eventInfo: {
    marginTop: 24,
    alignItems: 'center',
  },
  eventName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  scanText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});