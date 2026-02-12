import { useState, useMemo } from 'react';
import { exploreDummyData } from '@/stores/exploreStore';
import { Music, Utensils, Camera, Heart, Calendar } from 'lucide-react-native';

type FilterCategory =
  | 'all'
  | 'Food'
  | 'Nightlife'
  | 'Arts'
  | 'Culture'
  | 'Relaxation'
  | 'Music Fest'
  | 'Cultural';

type Category = 'all' | 'romantic-getaway' | 'sports' | 'relax';

export const useExploreFilters = (selectedCategory: Category = 'all') => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory | null>(
    null
  );

  // Filter options for the modal
  const filterOptions = [
    {
      id: 'food',
      label: 'Food & Dining',
      icon: Utensils,
      category: 'Food' as FilterCategory,
    },
    {
      id: 'nightlife',
      label: 'Nightlife',
      icon: Music,
      category: 'Nightlife' as FilterCategory,
    },
    {
      id: 'arts',
      label: 'Arts & Culture',
      icon: Camera,
      category: 'Arts' as FilterCategory,
    },
    {
      id: 'culture',
      label: 'Cultural Events',
      icon: Heart,
      category: 'Culture' as FilterCategory,
    },
    {
      id: 'relaxation',
      label: 'Relaxation',
      icon: Heart,
      category: 'Relaxation' as FilterCategory,
    },
    {
      id: 'music',
      label: 'Music Festivals',
      icon: Music,
      category: 'Music Fest' as FilterCategory,
    },
    {
      id: 'cultural',
      label: 'Cultural Festivals',
      icon: Calendar,
      category: 'Cultural' as FilterCategory,
    },
  ];

  // Search and filter experiences
  const filterExperiences = (
    experiences: typeof exploreDummyData.experiences
  ) => {
    let filteredExperiences = experiences;

    // Apply category filter
    if (selectedCategory !== 'all') {
      // Map categories to tags/descriptions for filtering
      const categoryKeywords: Record<Category, string[]> = {
        'romantic-getaway': ['romantic', 'sunset', 'cruise', 'couple'],
        sports: ['sports', 'active', 'adventure'],
        relax: ['relax', 'peaceful', 'nature', 'cherry', 'walking'],
        all: [],
      };

      const keywords = categoryKeywords[selectedCategory];
      if (keywords.length > 0) {
        filteredExperiences = filteredExperiences.filter((exp) =>
          keywords.some(
            (keyword) =>
              exp.title.toLowerCase().includes(keyword) ||
              exp.description.toLowerCase().includes(keyword) ||
              exp.tags.some((tag) => tag.toLowerCase().includes(keyword))
          )
        );
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filteredExperiences = filteredExperiences.filter(
        (exp) =>
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.subtitle &&
            exp.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exp.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter if selected
    if (selectedFilter && selectedFilter !== 'all') {
      filteredExperiences = filteredExperiences.filter((exp) =>
        exp.categories.includes(selectedFilter)
      );
    }

    return filteredExperiences;
  };

  // Search and filter events
  const filterEvents = (events: typeof exploreDummyData.featuredEvents) => {
    let filteredEvents = events;

    // Apply category filter
    if (selectedCategory !== 'all') {
      const categoryKeywords: Record<Category, string[]> = {
        'romantic-getaway': ['romantic', 'couple'],
        sports: ['sports', 'active'],
        relax: ['cultural', 'festival', 'nature'],
        all: [],
      };

      const keywords = categoryKeywords[selectedCategory];
      if (keywords.length > 0) {
        filteredEvents = filteredEvents.filter((event) =>
          keywords.some(
            (keyword) =>
              event.title.toLowerCase().includes(keyword) ||
              event.location.toLowerCase().includes(keyword)
          )
        );
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter if selected
    if (selectedFilter && selectedFilter !== 'all') {
      filteredEvents = filteredEvents.filter(
        (event) => event.category === selectedFilter
      );
    }

    return filteredEvents;
  };

  // Search and filter destinations
  const filterDestinations = (
    destinations: typeof exploreDummyData.destinations
  ) => {
    let filteredDestinations = destinations;

    // Apply category filter
    if (selectedCategory !== 'all') {
      const categoryKeywords: Record<Category, string[]> = {
        'romantic-getaway': ['beach', 'luxury', 'romantic'],
        sports: ['active', 'adventure'],
        relax: ['culture', 'beach', 'nature'],
        all: [],
      };

      const keywords = categoryKeywords[selectedCategory];
      if (keywords.length > 0) {
        filteredDestinations = filteredDestinations.filter((dest) =>
          keywords.some(
            (keyword) =>
              dest.name.toLowerCase().includes(keyword) ||
              dest.shortDescription.toLowerCase().includes(keyword) ||
              dest.tags.some((tag) => tag.toLowerCase().includes(keyword))
          )
        );
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filteredDestinations = filteredDestinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.shortDescription
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Apply filter if selected (filter by tags for destinations)
    if (selectedFilter && selectedFilter !== 'all') {
      const filterTagMap: Record<string, string> = {
        Food: 'food',
        Nightlife: 'nightlife',
        Arts: 'culture',
        Culture: 'culture',
        Relaxation: 'beach',
      };

      const tagToMatch = filterTagMap[selectedFilter];
      if (tagToMatch) {
        filteredDestinations = filteredDestinations.filter((dest) =>
          dest.tags.includes(tagToMatch)
        );
      }
    }

    return filteredDestinations;
  };

  // Filtered data using useMemo for performance
  const featuredItineraries = useMemo(() => {
    const experiences = filterExperiences(
      exploreDummyData.experiences.filter((exp) => exp.isFeatured)
    );

    return experiences.slice(0, 5).map((exp) => ({
      id: exp.id,
      title: exp.title,
      image_url: exp.heroImage,
      activity_count: exploreDummyData.itineraries.filter(
        (it) => it.experienceId === exp.id
      ).length,
      duration_days: Math.ceil(exp.durationMinutes / (60 * 24)),
    }));
  }, [searchQuery, selectedFilter, selectedCategory]);

  const featuredEvents = useMemo(() => {
    return filterEvents(exploreDummyData.featuredEvents);
  }, [searchQuery, selectedFilter, selectedCategory]);

  const experienceHighlights = useMemo(() => {
    return filterExperiences(
      exploreDummyData.experiences.filter((exp) => exp.isFeatured)
    );
  }, [searchQuery, selectedFilter, selectedCategory]);

  const popularDestinations = useMemo(() => {
    return filterDestinations(
      exploreDummyData.destinations.filter((dest) => dest.isFeatured)
    );
  }, [searchQuery, selectedFilter, selectedCategory]);

  return {
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    filterOptions,
    featuredItineraries,
    featuredEvents,
    experienceHighlights,
    popularDestinations,
  };
};

export type { FilterCategory };
