export interface TripMember {
  initials?: string;
  color?: string;
  image?: string;
}

export interface Trip {
  id: string;
  title: string;
  location: string;
  dateRange: string;
  duration: string;
  items: number;
  role: string;
  image: string;
  members: TripMember[];
  extraMembers: number;
}

// TODO: Replace with real trip data
export const UPCOMING_TRIPS: Trip[] = [
  {
    id: "1",
    title: "Festival in Fiji",
    location: "Suva, Fiji",
    dateRange: "Feb 14-21 2026",
    duration: "3 days",
    items: 12,
    role: "Leader",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600",
    members: [
      { initials: "KD", color: "#ef4444" },
      { initials: "AH", color: "#a855f7" },
      { image: "https://i.pravatar.cc/100?img=3" },
      { image: "https://i.pravatar.cc/100?img=4" },
    ],
    extraMembers: 2,
  },
  {
    id: "2",
    title: "Safari Adventure",
    location: "Nairobi, Kenya",
    dateRange: "Mar 5-12 2026",
    duration: "7 days",
    items: 8,
    role: "Member",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600",
    members: [
      { initials: "JM", color: "#3b82f6" },
      { image: "https://i.pravatar.cc/100?img=5" },
    ],
    extraMembers: 0,
  },
  {
    id: "3",
    title: "City Break",
    location: "Tokyo, Japan",
    dateRange: "Apr 1-5 2026",
    duration: "4 days",
    items: 5,
    role: "Leader",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600",
    members: [
      { initials: "YT", color: "#f59e0b" },
      { image: "https://i.pravatar.cc/100?img=8" },
      { initials: "LS", color: "#10b981" },
    ],
    extraMembers: 4,
  },
];

export interface ItineraryIncluded {
  icon: string;
  title: string;
  subtitle: string;
}

export interface Activity {
  title: string;
  description: string;
}

export interface DailyItinerary {
  day: number;
  activities: Activity[];
}

export interface Itinerary {
  id: string;
  title: string;
  location: string;
  duration: string;
  category: string;
  image: string;
  rating: number;
  reviewCount: number;
  activities: number;
  description?: string;
  included?: ItineraryIncluded[];
  dailyItinerary?: DailyItinerary[];
}

// TODO: Replace with real itinerary data
export const ITINERARIES_FOR_YOU: Itinerary[] = [
  {
    id: "1",
    title: "DITL: New York Edition!",
    location: "New York, USA",
    duration: "2 days",
    category: "City Break",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600",
    rating: 4.9,
    reviewCount: 128,
    activities: 7,
    description: "Explore New York's iconic landmarks and hidden gems. From Central Park picnics to museum hopping, discover the city's vibrant culture. Get ready for a laid-back adventure that captures the true essence of the Big Apple, all while discovering the city's unique charm and energy.",
    included: [
      {
        icon: "hotel",
        title: "Hotel Pickup",
        subtitle: "We offer complimentary pickup from select hotels."
      },
      {
        icon: "car",
        title: "Ground Transfers",
        subtitle: "Enjoy seamless transfers between locations."
      },
      {
        icon: "ticket",
        title: "Funicular Tickets",
        subtitle: "Tickets for the Montmartre funicular are included."
      }
    ],
    dailyItinerary: [
      {
        day: 1,
        activities: [
          {
            title: "Central Park Exploration",
            description: "Start your day with a peaceful stroll through Central Park, enjoying the scenic landscapes and perhaps stopping at a quiet bench to people-watch."
          },
          {
            title: "Art Gallery Visit",
            description: "Explore a local art gallery in Chelsea, allowing yourself to immerse in contemporary art and perhaps engage in conversation with the artists."
          },
          {
            title: "Brooklyn Bridge Walk",
            description: "Enjoy a picturesque walk across the Brooklyn Bridge, taking in stunning views of the Manhattan skyline as the sun begins to set."
          },
          {
            title: "DUMBO Coffee Break",
            description: "Relax at a cozy café in DUMBO, sipping on your favorite brew while admiring the unique architecture and atmosphere of the area."
          }
        ]
      },
      {
        day: 2,
        activities: [
          {
            title: "Statue of Liberty Ferry",
            description: "Take the ferry to Liberty Island and enjoy magnificent views of Lady Liberty and the harbor."
          },
          {
            title: "High Line Park Walk",
            description: "Walk along the elevated park built on a historic freight rail line, featuring lush gardens and public art."
          },
          {
            title: "Times Square at Night",
            description: "End your journey with the bright lights and bustling energy of Times Square."
          }
        ]
      }
    ]
  },
  {
    id: "2",
    title: "Temples & Street Food",
    location: "Bangkok, Thailand",
    duration: "4 days",
    category: "Culture & Food",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600",
    rating: 4.7,
    reviewCount: 94,
    activities: 12,
    description: "Experience the vibrant energy of Bangkok, from its majestic golden temples to the world-renowned street food scene. Immerse yourself in the local culture, navigate the bustling canals, and taste the authentic flavors of Thailand.",
    included: [
      {
        icon: "hotel",
        title: "Boutique Stay",
        subtitle: "Accommodation in a centrally located boutique hotel."
      },
      {
        icon: "car",
        title: "Tuk-Tuk Tours",
        subtitle: "Local transport via traditional tuk-tuks for all tours."
      },
      {
        icon: "ticket",
        title: "Entry Fees",
        subtitle: "Admission to the Grand Palace and major temples included."
      }
    ],
    dailyItinerary: [
      {
        day: 1,
        activities: [
          {
            title: "Grand Palace Marvels",
            description: "Visit the spectacular Grand Palace and the Temple of the Emerald Buddha, marveling at the intricate architecture."
          },
          {
            title: "River Canal Tour",
            description: "Explore the 'Venice of the East' with a long-tail boat ride through Bangkok's historic canals."
          }
        ]
      },
      {
        day: 2,
        activities: [
          {
            title: "Street Food Safari",
            description: "Join a guided night tour through Yaowarat (Chinatown) to sample the city's best street delicacies."
          }
        ]
      },
      {
        day: 3,
        activities: [
          {
            title: "Floating Market Trip",
            description: "A day trip to the colorful Damnoen Saduak floating market to see local trade in action."
          }
        ]
      },
      {
        day: 4,
        activities: [
          {
            title: "Thai Cooking Class",
            description: "Learn to cook classic Thai dishes like Pad Thai and Green Curry in a hands-on workshop."
          }
        ]
      }
    ]
  },
  {
    id: "3",
    title: "Northern Lights Hunt",
    location: "Tromsø, Norway",
    duration: "6 days",
    category: "Adventure",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400",
    rating: 4.8,
    reviewCount: 61,
    activities: 5,
    description: "Embark on an Arctic adventure in the heart of the aurora zone. Join expert guides as we chase the mystical Northern Lights across the stunning Norwegian landscape, combined with unique winter experiences.",
    included: [
      {
        icon: "hotel",
        title: "Arctic Lodge",
        subtitle: "Stay in a cozy lodge with prime aurora viewing decks."
      },
      {
        icon: "car",
        title: "Chase Transport",
        subtitle: "Specially equipped vehicles for chasing the lights across borders."
      },
      {
        icon: "ticket",
        title: "Gear Rental",
        subtitle: "Thermal suits and professional photography tripods provided."
      }
    ],
    dailyItinerary: [
      {
        day: 1,
        activities: [
          {
            title: "Welcome to Tromsø",
            description: "Arrival and evening briefing on how the Northern Lights occur and photography tips."
          }
        ]
      },
      {
        day: 2,
        activities: [
          {
            title: "Husky Sledding",
            description: "Drive your own dog team through the snow-covered valleys of the Arctic north."
          },
          {
            title: "Aurora Hunt #1",
            description: "Our first night chasing the lights with a campfire and local snacks."
          }
        ]
      },
      {
        day: 3,
        activities: [
          {
            title: "Fjord Cruise",
            description: "A silent electric boat cruise through the breathtaking Arctic fjords."
          }
        ]
      }
    ]
  },
  {
    id: "4",
    title: "Desert Dunes & Stars",
    location: "Merzouga, Morocco",
    duration: "3 days",
    category: "Adventure",
    image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400",
    rating: 4.6,
    reviewCount: 43,
    activities: 4,
    description: "Journey deep into the Sahara Desert for an unforgettable experience. Ride camels across the golden dunes of Erg Chebbi and spend a night under a canopy of a million stars in a traditional Berber camp.",
    included: [
      {
        icon: "hotel",
        title: "Luxury Camp",
        subtitle: "Night in a private tent with modern amenities in the dunes."
      },
      {
        icon: "car",
        title: "4x4 Transfer",
        subtitle: "Rugged desert transport from the city to the dune base."
      },
      {
        icon: "ticket",
        title: "Camel Trek",
        subtitle: "Sunset and sunrise camel rides through the Sahara."
      }
    ],
    dailyItinerary: [
      {
        day: 1,
        activities: [
          {
            title: "Into the Sahara",
            description: "Departure in 4x4 vehicles towards the golden dunes of Merzouga."
          },
          {
            title: "Sunset Camel Ride",
            description: "A peaceful trek across the dunes to watch the sun disappear over the horizon."
          }
        ]
      },
      {
        day: 2,
        activities: [
          {
            title: "Berber Culture",
            description: "Visit a local nomadic family to learn about their traditions and enjoy Saharan tea."
          }
        ]
      },
      {
        day: 3,
        activities: [
          {
            title: "Sunrise Peaks",
            description: "Early morning climb to the highest dune for a spectacular desert sunrise."
          }
        ]
      }
    ]
  },
];

export interface AddOn {
  id: string;
  title: string;
  category: string;
  rating: number;
  description: string;
  image: string;
  price: number;
}

export const ADD_ONS_FOR_YOU: AddOn[] = [
  {
    id: "1",
    title: "Exclusive Miami Sunset and City Lights Luxury Cocktail Cruise",
    category: "Food",
    rating: 4.5,
    description:
      "Immerse yourself in a beautiful evening with a cocktail cruise. Enjoy the sunset and city lights as you sip on our signature cocktails. Perfect for a romantic evening or a relaxing night out with friends.",
    image: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=600",
    price: 120,
  },
  {
    id: "2",
    title: "Premium Live Jazz and Exclusive Wine Tasting Night Experience",
    category: "Culture",
    rating: 4.8,
    description:
      "Immerse yourself in a night of fantastic jazz music and wine pairing delights. Discover new flavors as our expert sommeliers guide you through a curated selection of fine wines perfectly matched with light bites.",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600",
    price: 80,
  },
  {
    id: "3",
    title: "Private 30-Minute VIP Helicopter Tour of the Stunning Coastline",
    category: "Adventure",
    rating: 4.9,
    description:
      "See the stunning coastline from above in an unforgettable 30-minute helicopter ride. Take in breathtaking panoramic views of pristine beaches, dramatic cliffs, and crystal-clear waters from a unique vantage point.",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600",
    price: 250,
  },
];

export interface Destination {
  id: string;
  title: string;
  location: string;
  image: string;
}

export const DESTINATIONS_FOR_YOU: Destination[] = [
  {
    id: "1",
    title: "Wine under the mountains",
    location: "Cape Town, South Africa",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600",
  },
  {
    id: "2",
    title: "The city that never sleeps",
    location: "New York, USA",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600",
  },
  {
    id: "3",
    title: "Romantic canals",
    location: "Venice, Italy",
    image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600",
  },
];

export const FEATURED_ITINERARIES: Itinerary[] = [
  {
    id: "f1",
    title: "Serengeti Safari Adventure",
    location: "Serengeti, Tanzania",
    duration: "7 days",
    category: "Adventure",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600",
    rating: 4.9,
    reviewCount: 245,
    activities: 15,
  },
  {
    id: "f2",
    title: "Swiss Alps Hiking Trail",
    location: "Zermatt, Switzerland",
    duration: "5 days",
    category: "Nature",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600",
    rating: 4.8,
    reviewCount: 182,
    activities: 10,
  },
  {
    id: "f3",
    title: "Santorini Romance & Views",
    location: "Oia, Greece",
    duration: "3 days",
    category: "Romance",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600",
    rating: 4.9,
    reviewCount: 310,
    activities: 6,
  },
  {
    id: "f4",
    title: "Kyoto Heritage Tour",
    location: "Kyoto, Japan",
    duration: "4 days",
    category: "Culture",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600",
    rating: 4.7,
    reviewCount: 156,
    activities: 8,
  },
];

export const EXPERIENCE_HIGHLIGHTS: AddOn[] = [
  {
    id: "h1",
    title: "Aurora Borealis Night Photography Tour with Expert Guide",
    category: "Photography",
    rating: 4.9,
    description:
      "Capture the ethereal beauty of the Northern Lights with professional guidance. We'll take you to the best spots and help you dial in your camera settings for that perfect celestial shot.",
    image: "https://images.unsplash.com/photo-1483347756191-d5efbf27670e?w=600",
    price: 150,
  },
  {
    id: "h2",
    title: "Traditional Kaiseki Dining Experience in a Hidden Kyoto Gion",
    category: "Food",
    rating: 5.0,
    description:
      "Multi-course haute cuisine that balances taste, texture, and appearance. Experience the pinnacle of Japanese culinary art in an intimate, historic setting.",
    image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600",
    price: 320,
  },
  {
    id: "h3",
    title: "Sunrise Hot Air Balloon Ride Over Cappadocia's Fairy Chimneys",
    category: "Adventure",
    rating: 4.9,
    description:
      "Float gently over the surreal landscapes of Cappadocia as the sun rises. A magical perspective of Turkey's unique volcanic formations and ancient cave dwellings.",
    image: "https://images.unsplash.com/photo-1527838832700-505925240cff?w=600",
    price: 280,
  },
  {
    id: "h4",
    title: "Deep Sea Diving Exploration of the Great Barrier Reef",
    category: "Nature",
    rating: 4.7,
    description:
      "Discover the world's largest coral reef system. Swim alongside majestic sea turtles and vibrant fish in one of the most biodiverse environments on Earth.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600",
    price: 450,
  },
];

export const DESTINATION_HIGHLIGHTS: Destination[] = [
  {
    id: "d1",
    title: "The Heart of the Alps",
    location: "Innsbruck, Austria",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600",
  },
  {
    id: "d2",
    title: "Mystical Zen Gardens",
    location: "Kyoto, Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600",
  },
  {
    id: "d3",
    title: "Eternal Blue Vistas",
    location: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600",
  },
];

export interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  category: string;
  image: string;
}

export const UPCOMING_EVENTS: Event[] = [
  {
    id: "e1",
    title: "Coachella 2026",
    location: "Indio, California",
    date: "April 26 - 28th 2026",
    time: "12PM",
    category: "MUSIC FEST",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600",
  },
  {
    id: "e2",
    title: "Cherry Blossom",
    location: "Tokyo, Japan",
    date: "March 20 - April 10 2026",
    time: "All Day",
    category: "CULTURAL",
    image: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600",
  },
  {
    id: "e3",
    title: "Wimbledon Final",
    location: "London, UK",
    date: "July 12th 2026",
    time: "2PM",
    category: "SPORT",
    image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600",
  },
  {
    id: "e4",
    title: "Burning Man",
    location: "Black Rock City, NV",
    date: "Aug 30 - Sep 7 2026",
    time: "All Day",
    category: "CULTURAL",
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600",
  },
  {
    id: "e5",
    title: "Tomorrowland",
    location: "Boom, Belgium",
    date: "July 17 - 19 2026",
    time: "12PM",
    category: "MUSIC FEST",
    image: "https://images.unsplash.com/photo-1514525253361-bee24386b17b?w=600",
  },
  {
    id: "e6",
    title: "Super Bowl LX",
    location: "Santa Clara, CA",
    date: "Feb 8th 2026",
    time: "3:30PM",
    category: "SPORT",
    image: "https://images.unsplash.com/photo-1454162272261-da491f71802b?w=600",
  },
  {
    id: "e7",
    title: "Taste of Chicago",
    location: "Chicago, IL",
    date: "July 8 - 12th 2026",
    time: "11AM",
    category: "FOOD",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600",
  },
  {
    id: "e8",
    title: "Munich Oktoberfest",
    location: "Munich, Germany",
    date: "Sep 19 - Oct 4th 2026",
    time: "10AM",
    category: "FOOD",
    image: "https://images.unsplash.com/photo-1555658636-6e4a3621464c?w=600",
  },
  {
    id: "e9",
    title: "Aspen Food & Wine",
    location: "Aspen, CO",
    date: "June 19 - 21st 2026",
    time: "9AM",
    category: "FOOD",
    image: "https://images.unsplash.com/photo-1414235077428-33b07bd44c83?w=600",
  },
];

export interface ExploreCategory {
  id: string;
  name: string;
  emoji: string;
}

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: "1", name: "Romance", emoji: "❤️" },
  { id: "2", name: "Arts", emoji: "🎭" },
  { id: "3", name: "Conferences", emoji: "💼" },
  { id: "4", name: "Nightlife", emoji: "🎉" },
  { id: "5", name: "Concerts", emoji: "🎸" },
  { id: "6", name: "Adventure", emoji: "⛰️" },
  { id: "7", name: "Food & Drink", emoji: "🍴" },
  { id: "8", name: "Nature", emoji: "🌲" },
  { id: "9", name: "Shopping", emoji: "🛍️" },
  { id: "10", name: "Wellness", emoji: "🧘" },
];




