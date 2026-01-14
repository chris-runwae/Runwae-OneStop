import { ExploreData } from '@/types/explore';

export const exploreDummyData: ExploreData = {
  destinations: [
    {
      id: 'dest-miami',
      name: 'Miami',
      city: 'Miami',
      country: 'USA',
      slug: 'miami',
      shortDescription:
        'Sun-soaked beaches, vibrant nightlife, and stunning waterfront views.',
      heroImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      thumbnailImage:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      tags: ['beach', 'nightlife', 'luxury'],
      isFeatured: true,
      popularityScore: 95,
    },
    {
      id: 'dest-lagos',
      name: 'Lagos',
      city: 'Lagos',
      country: 'Nigeria',
      slug: 'lagos',
      shortDescription:
        'A bustling city of music, food, markets, and unforgettable energy.',
      heroImage: 'https://images.unsplash.com/photo-1600267185393-e158a98703de',
      thumbnailImage:
        'https://images.unsplash.com/photo-1600267185393-e158a98703de',
      tags: ['culture', 'food', 'nightlife'],
      isFeatured: true,
      popularityScore: 90,
    },
    {
      id: 'dest-tokyo',
      name: 'Tokyo',
      city: 'Tokyo',
      country: 'Japan',
      slug: 'tokyo',
      shortDescription:
        'Tradition meets modernity in Japan’s electric capital.',
      heroImage: 'https://images.unsplash.com/photo-1549693578-d683be217e58',
      thumbnailImage:
        'https://images.unsplash.com/photo-1549693578-d683be217e58',
      tags: ['culture', 'food', 'technology'],
      isFeatured: true,
      popularityScore: 98,
    },
  ],

  experiences: [
    {
      id: 'exp-miami-sunset-cruise',
      destinationId: 'dest-miami',
      title: 'Miami Sunset and City Lights Cocktail Cruise',
      subtitle: 'Sunset • Cocktails • Live Music',
      location: 'Miami, Florida',
      rating: 4.8,
      reviewCount: 211,
      priceFrom: 120,
      currency: 'USD',
      durationMinutes: 120,
      activityLevel: 'low',
      heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      galleryImages: [
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        'https://images.unsplash.com/photo-1526772662000-3f88f10405ff',
      ],
      categories: ['Food', 'Nightlife'],
      tags: ['sunset', 'romantic', 'cruise'],
      description:
        'Set sail for a dazzling Miami adventure featuring sunset views, cocktails, live music, and city lights along Biscayne Bay.',
      isFeatured: true,
    },
    {
      id: 'exp-lagos-afrobeats',
      destinationId: 'dest-lagos',
      title: 'Dance to the Afrobeat Sound',
      subtitle: 'Music • Food • Nightlife',
      location: 'Lagos, Nigeria',
      rating: 4.8,
      reviewCount: 134,
      priceFrom: 45,
      currency: 'USD',
      durationMinutes: 180,
      activityLevel: 'medium',
      heroImage: 'https://images.unsplash.com/photo-1598387844521-55a3c2a87b4f',
      galleryImages: [
        'https://images.unsplash.com/photo-1598387844521-55a3c2a87b4f',
        'https://images.unsplash.com/photo-1600267185393-e158a98703de',
      ],
      categories: ['Nightlife', 'Arts', 'Food'],
      tags: ['afrobeats', 'culture', 'local'],
      description:
        'Immerse yourself in Lagos nightlife with Afrobeat music, street food, and unforgettable energy.',
      isFeatured: true,
    },
    {
      id: 'exp-tokyo-cherry-blossom',
      destinationId: 'dest-tokyo',
      title: 'Cherry Blossom Evening Walk',
      subtitle: 'Seasonal • Cultural',
      location: 'Tokyo, Japan',
      rating: 4.7,
      reviewCount: 98,
      priceFrom: 35,
      currency: 'USD',
      durationMinutes: 90,
      activityLevel: 'low',
      heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
      galleryImages: [
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
        'https://images.unsplash.com/photo-1549693578-d683be217e58',
      ],
      categories: ['Culture', 'Relaxation'],
      tags: ['cherry-blossom', 'walking', 'nature'],
      description:
        'Enjoy a peaceful guided walk through Tokyo’s cherry blossom spots with cultural storytelling.',
      isFeatured: true,
    },
  ],

  itineraries: [
    {
      experienceId: 'exp-miami-sunset-cruise',
      order: 1,
      title: 'Sunset Departure',
      description: 'Board the yacht and enjoy a complimentary welcome drink.',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    },
    {
      experienceId: 'exp-miami-sunset-cruise',
      order: 2,
      title: 'Live Music & Cocktails',
      description:
        'Enjoy live music from local artists while sipping handcrafted cocktails.',
    },
    {
      experienceId: 'exp-miami-sunset-cruise',
      order: 3,
      title: 'City Lights Tour',
      description: 'Cruise past Miami’s skyline as the city lights come alive.',
    },
  ],

  experienceInfo: [
    {
      experienceId: 'exp-miami-sunset-cruise',
      type: 'guest_requirements',
      content: 'Guests must be 18+ and bring a valid ID.',
    },
    {
      experienceId: 'exp-miami-sunset-cruise',
      type: 'what_to_bring',
      content: 'Comfortable shoes, a light jacket, and your camera.',
    },
    {
      experienceId: 'exp-miami-sunset-cruise',
      type: 'dining',
      content: 'Craft cocktails and light bites are included.',
    },
    {
      experienceId: 'exp-miami-sunset-cruise',
      type: 'cancellation_policy',
      content: 'Free cancellation up to 72 hours before departure.',
    },
  ],

  reviews: [
    {
      id: 'rev-1',
      experienceId: 'exp-miami-sunset-cruise',
      user: {
        name: 'Samantha Cruz',
        username: '@samantha.cruz',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      },
      rating: 5,
      comment:
        'Just enjoyed a stunning sunset on the Miami Sunset Cocktail Cruise! The colors in the sky were mesmerizing.',
      createdAt: '3 days ago',
    },
    {
      id: 'rev-2',
      experienceId: 'exp-miami-sunset-cruise',
      user: {
        name: 'Michael Lee',
        username: '@mikelee',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      },
      rating: 4,
      comment:
        'Great vibe, good drinks, and amazing views of the skyline at night.',
      createdAt: '5 days ago',
    },
  ],

  featuredEvents: [
    {
      id: 'event-coachella-2026',
      title: 'Coachella 2026',
      location: 'Indio, California',
      category: 'Music Fest',
      startDate: '2026-04-26',
      endDate: '2026-04-28',
      time: '12:00 PM',
      heroImage: 'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2',
    },
    {
      id: 'event-cherry-blossom',
      title: 'Cherry Blossom Festival',
      location: 'Tokyo, Japan',
      category: 'Cultural',
      startDate: '2026-01-01',
      time: '3:00 PM',
      heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e',
    },
  ],
};
