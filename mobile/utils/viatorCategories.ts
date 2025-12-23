// Types
export interface SubCategory {
  id: number;
  name: string;
  displayName: string;
}

export interface MainCategory {
  id: number;
  name: string;
  displayName: string;
  emoji: string;
  subcategories: SubCategory[];
}

// Main categories configuration
export const VIATOR_CATEGORIES: MainCategory[] = [
  {
    id: 21913,
    name: 'tours_sightseeing_cruises',
    displayName: 'Tours & Sightseeing',
    emoji: '🗺️',
    subcategories: [
      {
        id: 21725,
        name: 'sightseeing_tours',
        displayName: 'Sightseeing Tours',
      },
      { id: 22046, name: 'adventure_tours', displayName: 'Adventure Tours' },
      { id: 11929, name: 'walking_tours', displayName: 'Walking Tours' },
      { id: 11930, name: 'bus_tours', displayName: 'Bus Tours' },
      { id: 13018, name: 'bike_tours', displayName: 'Bike Tours' },
      { id: 12026, name: 'helicopter_tours', displayName: 'Helicopter Tours' },
      { id: 11923, name: 'night_tours', displayName: 'Night Tours' },
      {
        id: 11903,
        name: 'photography_tours',
        displayName: 'Photography Tours',
      },
      { id: 11939, name: 'private_tours', displayName: 'Private Tours' },
      { id: 21701, name: 'cruises_sailing', displayName: 'Cruises & Sailing' },
    ],
  },
  {
    id: 21911,
    name: 'food_drink',
    displayName: 'Food & Drink',
    emoji: '🍽️',
    subcategories: [
      { id: 11917, name: 'food_tours', displayName: 'Food Tours' },
      { id: 11916, name: 'cooking_classes', displayName: 'Cooking Classes' },
      { id: 11915, name: 'wine_tasting', displayName: 'Wine Tasting' },
      { id: 11914, name: 'brewery_tours', displayName: 'Brewery Tours' },
      {
        id: 11890,
        name: 'dining_experiences',
        displayName: 'Dining Experiences',
      },
      { id: 11965, name: 'dinner_cruises', displayName: 'Dinner Cruises' },
    ],
  },
  {
    id: 21910,
    name: 'arts_culture',
    displayName: 'Arts & Culture',
    emoji: '🎭',
    subcategories: [
      { id: 11920, name: 'museum_tours', displayName: 'Museum Tours' },
      { id: 11921, name: 'art_classes', displayName: 'Art Classes' },
      { id: 21765, name: 'shows', displayName: 'Theater & Shows' },
      { id: 11922, name: 'historical_tours', displayName: 'Historical Tours' },
      {
        id: 11924,
        name: 'architecture_tours',
        displayName: 'Architecture Tours',
      },
      {
        id: 11925,
        name: 'cultural_performances',
        displayName: 'Cultural Performances',
      },
      { id: 11926, name: 'craft_workshops', displayName: 'Craft Workshops' },
    ],
  },
  {
    id: 21909,
    name: 'outdoor_activities',
    displayName: 'Outdoor Activities',
    emoji: '⛰️',
    subcategories: [
      { id: 11927, name: 'hiking_trekking', displayName: 'Hiking & Trekking' },
      {
        id: 11928,
        name: 'zipline_adventures',
        displayName: 'Zipline Adventures',
      },
      { id: 11931, name: 'rock_climbing', displayName: 'Rock Climbing' },
      { id: 11932, name: 'safari_wildlife', displayName: 'Safari & Wildlife' },
      {
        id: 11933,
        name: 'skiing_snow_sports',
        displayName: 'Skiing & Snow Sports',
      },
      { id: 11934, name: 'mountain_biking', displayName: 'Mountain Biking' },
    ],
  },
  {
    id: 21442,
    name: 'water_activities',
    displayName: 'Water Activities',
    emoji: '🌊',
    subcategories: [
      { id: 11935, name: 'snorkeling', displayName: 'Snorkeling' },
      { id: 11936, name: 'scuba_diving', displayName: 'Scuba Diving' },
      { id: 11937, name: 'kayaking', displayName: 'Kayaking & Canoeing' },
      { id: 11938, name: 'sailing', displayName: 'Sailing' },
      { id: 11941, name: 'surfing', displayName: 'Surfing Lessons' },
      { id: 11942, name: 'fishing', displayName: 'Fishing Charters' },
      { id: 11943, name: 'jet_skiing', displayName: 'Jet Skiing' },
      { id: 11944, name: 'rafting', displayName: 'Rafting' },
    ],
  },
  {
    id: 21912,
    name: 'nature_wildlife',
    displayName: 'Nature & Wildlife',
    emoji: '🦁',
    subcategories: [
      { id: 11945, name: 'national_parks', displayName: 'National Parks' },
      {
        id: 11946,
        name: 'wildlife_watching',
        displayName: 'Wildlife Watching',
      },
      { id: 11947, name: 'bird_watching', displayName: 'Bird Watching' },
      {
        id: 11948,
        name: 'botanical_gardens',
        displayName: 'Botanical Gardens',
      },
      { id: 11949, name: 'nature_walks', displayName: 'Nature Walks' },
      { id: 11950, name: 'eco_tours', displayName: 'Eco Tours' },
      { id: 11951, name: 'farm_visits', displayName: 'Farm Visits' },
    ],
  },
  {
    id: 21914,
    name: 'classes_workshops',
    displayName: 'Classes & Workshops',
    emoji: '🎨',
    subcategories: [
      { id: 11916, name: 'cooking_classes', displayName: 'Cooking Classes' },
      { id: 11921, name: 'art_classes', displayName: 'Art Classes' },
      { id: 11952, name: 'dance_classes', displayName: 'Dance Classes' },
      { id: 11926, name: 'craft_workshops', displayName: 'Craft Workshops' },
      {
        id: 11953,
        name: 'photography_workshops',
        displayName: 'Photography Workshops',
      },
    ],
  },
  {
    id: 21916,
    name: 'seasonal_special',
    displayName: 'Seasonal & Events',
    emoji: '🎄',
    subcategories: [
      { id: 11892, name: 'christmas', displayName: 'Christmas' },
      { id: 11893, name: 'halloween', displayName: 'Halloween' },
      { id: 11957, name: 'easter', displayName: 'Easter' },
      { id: 11898, name: 'valentines', displayName: "Valentine's Day" },
      { id: 11896, name: 'new_years', displayName: "New Year's" },
      { id: 21583, name: 'chinese_new_year', displayName: 'Chinese New Year' },
      {
        id: 11895,
        name: 'national_holidays',
        displayName: 'National Holidays',
      },
    ],
  },
  {
    id: 21908,
    name: 'entertainment_tickets',
    displayName: 'Entertainment',
    emoji: '🎪',
    subcategories: [
      { id: 21765, name: 'shows', displayName: 'Shows & Performances' },
      { id: 11954, name: 'theme_parks', displayName: 'Theme Parks' },
      { id: 11955, name: 'concerts', displayName: 'Concerts' },
      { id: 11956, name: 'sporting_events', displayName: 'Sporting Events' },
    ],
  },
];

// Special features that can be applied across categories
export const SPECIAL_FEATURES = [
  {
    id: 11940,
    name: 'lifetime_experiences',
    displayName: 'Lifetime Experiences',
  },
  { id: 21074, name: 'unique_experiences', displayName: 'Unique Experiences' },
  { id: 12074, name: 'skip_the_line', displayName: 'Skip the Line' },
  { id: 11919, name: 'kid_friendly', displayName: 'Kid-Friendly' },
  { id: 20222, name: 'lgbt_friendly', displayName: 'LGBT Friendly' },
  { id: 367655, name: 'award_winner', displayName: 'Award Winners' },
];

// Helper function to get filter display name with emoji
export const getFilterDisplayName = (categoryId: number): string => {
  const category = VIATOR_CATEGORIES.find((cat) => cat.id === categoryId);
  return category ? `${category.displayName} ${category.emoji}` : '';
};

// Helper function to get full category name for "More" links
export const getFullCategoryName = (categoryId: number): string => {
  const category = VIATOR_CATEGORIES.find((cat) => cat.id === categoryId);
  return category ? category.displayName : '';
};

// Helper function to get all subcategory IDs for a main category
export const getSubcategoryIds = (categoryId: number): number[] => {
  const category = VIATOR_CATEGORIES.find((cat) => cat.id === categoryId);
  return category ? category.subcategories.map((sub) => sub.id) : [];
};
