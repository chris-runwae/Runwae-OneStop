// services/events.service.ts

import { supabase } from '@/lib/supabase';
import type { Event, EventAttendee, EventFilters, AttendanceStatus } from '@/types/events';

const EVENTS_PER_PAGE = 20;

export const EventsService = {
  /**
   * Fetch paginated events with filters
   * RLS: Public read access for published events
   */
  async getEvents(filters: EventFilters = {}, page = 0) {
    try {
      let query = supabase
        .from('events')
        .select('*, event_attendees!left(user_id, attendance_status)', { count: 'exact' })
        .eq('is_published', true)
        .order('start_date', { ascending: true });

      // Apply filters
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.startDate) {
        query = query.gte('start_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('end_date', filters.endDate);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.searchQuery) {
        query = query.or(
          `name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
        );
      }

      // Pagination
      const from = page * EVENTS_PER_PAGE;
      const to = from + EVENTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        events: data as Event[],
        totalCount: count || 0,
        hasMore: count ? (page + 1) * EVENTS_PER_PAGE < count : false,
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  /**
   * Fetch single event with attendance info
   * RLS: Public read for published events
   */
  async getEventById(eventId: string, userId?: string) {
    try {
      const query = supabase
        .from('events')
        .select(`
          *,
          event_attendees!left(user_id, attendance_status)
        `)
        .eq('id', eventId)
        .eq('is_published', true)
        .single();

      const { data, error } = await query;

      if (error) throw error;

      // Check if current user is attending
      const userAttendance = userId
        ? (data.event_attendees as any[])?.find(a => a.user_id === userId)
        : null;

      return {
        ...data,
        user_attendance: userAttendance,
        is_attending: userAttendance?.attendance_status === 'going',
      } as Event & { user_attendance?: EventAttendee; is_attending: boolean };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  /**
   * Update attendance status
   * RLS: Users can only modify their own attendance records
   */
  async updateAttendance(
    eventId: string,
    userId: string,
    status: AttendanceStatus
  ): Promise<EventAttendee> {
    try {
      // Upsert attendance record
      const { data, error } = await supabase
        .from('event_attendees')
        .upsert(
          {
            event_id: eventId,
            user_id: userId,
            attendance_status: status,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'event_id,user_id',
          }
        )
        .select()
        .single();

      if (error) throw error;

      return data as EventAttendee;
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  },

  /**
   * Cancel attendance (soft delete by setting status to 'cancelled')
   */
  async cancelAttendance(eventId: string, userId: string) {
    return this.updateAttendance(eventId, userId, 'cancelled');
  },

  /**
   * Add event to trip itinerary
   * Creates an itinerary item of type 'event'
   */
  async addEventToTrip(params: {
    tripId: string;
    eventId: string;
    date: string;
    userId: string;
  }) {
    try {
      // First, fetch event details
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('name, description, location, start_date, end_date, image_url')
        .eq('id', params.eventId)
        .single();

      if (eventError) throw eventError;

      // Create itinerary item
      const { data, error } = await supabase
        .from('itinerary_items')
        .insert({
          trip_id: params.tripId,
          date: params.date,
          type: 'event',
          title: event.name,
          description: event.description,
          location: event.location,
          start_time: event.start_date,
          end_time: event.end_date,
          metadata: {
            event_id: params.eventId,
            image_url: event.image_url,
          },
          created_by: params.userId,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error adding event to trip:', error);
      throw error;
    }
  },

  /**
   * Get user's attended events
   */
  async getUserEvents(userId: string) {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          events (*)
        `)
        .eq('user_id', userId)
        .in('attendance_status', ['going', 'interested'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => item.events) as Event[];
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw error;
    }
  },
};