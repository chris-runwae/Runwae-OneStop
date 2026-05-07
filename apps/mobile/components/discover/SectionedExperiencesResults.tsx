import { api } from '@runwae/convex/convex/_generated/api';
import { useAction, useQuery } from 'convex/react';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import CollapsibleSection from './CollapsibleSection';
import DiscoverHScroll from './DiscoverHScroll';
import type { EventCardInput } from './DiscoverEventCard';
import { type DiscoveryItem, VIATOR_TAGS } from './types';

interface SectionedExperiencesResultsProps {
  term: string;
  bottomInset: number;
}

type SectionKey =
  | 'mostPopular'
  | 'sightsToSee'
  | 'adventureTours'
  | 'placesToEat'
  | 'events';

type SectionState = Record<SectionKey, DiscoveryItem[] | null>;

const INITIAL_STATE: SectionState = {
  mostPopular: null,
  sightsToSee: null,
  adventureTours: null,
  placesToEat: null,
  events: null,
};

const SectionedExperiencesResults: React.FC<
  SectionedExperiencesResultsProps
> = ({ term, bottomInset }) => {
  const searchByCategory = useAction(api.discovery.searchByCategory);
  const dbResults = useQuery(api.search.searchExperiences, {
    term,
    limit: 10,
  });

  const [sections, setSections] = useState<SectionState>(INITIAL_STATE);

  const fetchAll = useCallback(async () => {
    setSections(INITIAL_STATE);

    const calls: { key: SectionKey; promise: Promise<DiscoveryItem[]> }[] = [
      {
        key: 'mostPopular',
        promise: searchByCategory({
          category: 'tour',
          term,
          limit: 10,
          sortBy: 'POPULARITY',
        }) as Promise<DiscoveryItem[]>,
      },
      {
        key: 'sightsToSee',
        promise: searchByCategory({
          category: 'tour',
          term,
          limit: 10,
          tags: [VIATOR_TAGS.SIGHTSEEING],
        }) as Promise<DiscoveryItem[]>,
      },
      {
        key: 'adventureTours',
        promise: searchByCategory({
          category: 'adventure',
          term,
          limit: 10,
          tags: [VIATOR_TAGS.ADVENTURE],
        }) as Promise<DiscoveryItem[]>,
      },
      {
        key: 'placesToEat',
        promise: searchByCategory({
          category: 'eat',
          term,
          limit: 10,
        }) as Promise<DiscoveryItem[]>,
      },
      {
        key: 'events',
        promise: searchByCategory({
          category: 'event',
          term,
          limit: 10,
        }) as Promise<DiscoveryItem[]>,
      },
    ];

    // Resolve each section independently so a slow/failed call doesn't
    // block the rest of the page from rendering.
    for (const call of calls) {
      call.promise
        .catch(() => [] as DiscoveryItem[])
        .then((items) =>
          setSections((s) => ({ ...s, [call.key]: items })),
        );
    }
  }, [searchByCategory, term]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Map DB events into the EventCardInput shape the scroller expects.
  // dbResults is undefined while the query is loading; events while loading
  // simply means no DB rows yet — the external Ticketmaster results still
  // populate the scroller.
  const dbEventCards: EventCardInput[] = useMemo(() => {
    if (!dbResults?.events) return [];
    return dbResults.events.map((e) => ({
      kind: 'db' as const,
      id: e._id,
      slug: e.slug,
      name: e.name,
      imageUrl: e.imageUrl,
      category: e.category,
      startDateUtc: e.startDateUtc,
      timezone: e.timezone,
      locationName: e.locationName,
    }));
  }, [dbResults]);

  const navigateToCategory = useCallback(
    (category: 'tour' | 'eat' | 'event' | 'adventure') => {
      router.push({
        pathname: '/experiences-search/results',
        params: { term, category },
      });
    },
    [term],
  );

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: 8, paddingBottom: bottomInset + 32 }}
      showsVerticalScrollIndicator={false}>
      <CollapsibleSection
        title="Most popular"
        count={sections.mostPopular?.length ?? undefined}
        onSeeMore={() => navigateToCategory('tour')}
        defaultOpen>
        <DiscoverHScroll items={sections.mostPopular} cardVariant="addOn" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Sights to see"
        count={sections.sightsToSee?.length ?? undefined}
        onSeeMore={() => navigateToCategory('tour')}
        defaultOpen>
        <DiscoverHScroll items={sections.sightsToSee} cardVariant="addOn" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Adventure tours"
        count={sections.adventureTours?.length ?? undefined}
        onSeeMore={() => navigateToCategory('adventure')}
        defaultOpen>
        <DiscoverHScroll
          items={sections.adventureTours}
          cardVariant="addOn"
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Places to eat"
        count={sections.placesToEat?.length ?? undefined}
        onSeeMore={() => navigateToCategory('eat')}
        defaultOpen={false}>
        <DiscoverHScroll items={sections.placesToEat} cardVariant="addOn" />
      </CollapsibleSection>

      <CollapsibleSection
        title="Events"
        count={
          (sections.events?.length ?? 0) + dbEventCards.length || undefined
        }
        onSeeMore={() => navigateToCategory('event')}
        defaultOpen={false}>
        <DiscoverHScroll
          items={sections.events}
          cardVariant="event"
          dbEvents={dbEventCards}
        />
      </CollapsibleSection>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default SectionedExperiencesResults;
