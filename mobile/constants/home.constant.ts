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
    description:
      "Explore New York's iconic landmarks and hidden gems. From Central Park picnics to museum hopping, discover the city's vibrant culture. Get ready for a laid-back adventure that captures the true essence of the Big Apple, all while discovering the city's unique charm and energy.",
    included: [
      {
        icon: "hotel",
        title: "Hotel Pickup",
        subtitle: "We offer complimentary pickup from select hotels.",
      },
      {
        icon: "car",
        title: "Ground Transfers",
        subtitle: "Enjoy seamless transfers between locations.",
      },
      {
        icon: "ticket",
        title: "Funicular Tickets",
        subtitle: "Tickets for the Montmartre funicular are included.",
      },
    ],
    dailyItinerary: [
      {
        day: 1,
        activities: [
          {
            title: "Central Park Exploration",
            description:
              "Start your day with a peaceful stroll through Central Park, enjoying the scenic landscapes and perhaps stopping at a quiet bench to people-watch.",
          },
          {
            title: "Art Gallery Visit",
            description:
              "Explore a local art gallery in Chelsea, allowing yourself to immerse in contemporary art and perhaps engage in conversation with the artists.",
          },
          {
            title: "Brooklyn Bridge Walk",
            description:
              "Enjoy a picturesque walk across the Brooklyn Bridge, taking in stunning views of the Manhattan skyline as the sun begins to set.",
          },
          {
            title: "DUMBO Coffee Break",
            description:
              "Relax at a cozy café in DUMBO, sipping on your favorite brew while admiring the unique architecture and atmosphere of the area.",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            title: "Statue of Liberty Ferry",
            description:
              "Take the ferry to Liberty Island and enjoy magnificent views of Lady Liberty and the harbor.",
          },
          {
            title: "High Line Park Walk",
            description:
              "Walk along the elevated park built on a historic freight rail line, featuring lush gardens and public art.",
          },
          {
            title: "Times Square at Night",
            description:
              "End your journey with the bright lights and bustling energy of Times Square.",
          },
        ],
      },
    ],
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
    description:
      "Experience the vibrant energy of Bangkok, from its majestic golden temples to the world-renowned street food scene. Immerse yourself in the local culture, navigate the bustling canals, and taste the authentic flavors of Thailand.",
    included: [
      {
        icon: "hotel",
        title: "Boutique Stay",
        subtitle: "Accommodation in a centrally located boutique hotel.",
      },
      {
        icon: "car",
        title: "Tuk-Tuk Tours",
        subtitle: "Local transport via traditional tuk-tuks for all tours.",
      },
      {
        icon: "ticket",
        title: "Entry Fees",
        subtitle: "Admission to the Grand Palace and major temples included.",
      },
    ],
    dailyItinerary: [
      {
        day: 1,
        activities: [
          {
            title: "Grand Palace Marvels",
            description:
              "Visit the spectacular Grand Palace and the Temple of the Emerald Buddha, marveling at the intricate architecture.",
          },
          {
            title: "River Canal Tour",
            description:
              "Explore the 'Venice of the East' with a long-tail boat ride through Bangkok's historic canals.",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            title: "Street Food Safari",
            description:
              "Join a guided night tour through Yaowarat (Chinatown) to sample the city's best street delicacies.",
          },
        ],
      },
      {
        day: 3,
        activities: [
          {
            title: "Floating Market Trip",
            description:
              "A day trip to the colorful Damnoen Saduak floating market to see local trade in action.",
          },
        ],
      },
      {
        day: 4,
        activities: [
          {
            title: "Thai Cooking Class",
            description:
              "Learn to cook classic Thai dishes like Pad Thai and Green Curry in a hands-on workshop.",
          },
        ],
      },
    ],
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
    description:
      "Embark on an Arctic adventure in the heart of the aurora zone. Join expert guides as we chase the mystical Northern Lights across the stunning Norwegian landscape, combined with unique winter experiences.",
    included: [
      {
        icon: "hotel",
        title: "Arctic Lodge",
        subtitle: "Stay in a cozy lodge with prime aurora viewing decks.",
      },
      {
        icon: "car",
        title: "Chase Transport",
        subtitle:
          "Specially equipped vehicles for chasing the lights across borders.",
      },
      {
        icon: "ticket",
        title: "Gear Rental",
        subtitle:
          "Thermal suits and professional photography tripods provided.",
      },
    ],
    dailyItinerary: [
      {
        day: 1,
        activities: [
          {
            title: "Welcome to Tromsø",
            description:
              "Arrival and evening briefing on how the Northern Lights occur and photography tips.",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            title: "Husky Sledding",
            description:
              "Drive your own dog team through the snow-covered valleys of the Arctic north.",
          },
          {
            title: "Aurora Hunt #1",
            description:
              "Our first night chasing the lights with a campfire and local snacks.",
          },
        ],
      },
      {
        day: 3,
        activities: [
          {
            title: "Fjord Cruise",
            description:
              "A silent electric boat cruise through the breathtaking Arctic fjords.",
          },
        ],
      },
    ],
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
    description:
      "Journey deep into the Sahara Desert for an unforgettable experience. Ride camels across the golden dunes of Erg Chebbi and spend a night under a canopy of a million stars in a traditional Berber camp.",
    included: [
      {
        icon: "hotel",
        title: "Luxury Camp",
        subtitle: "Night in a private tent with modern amenities in the dunes.",
      },
      {
        icon: "car",
        title: "4x4 Transfer",
        subtitle: "Rugged desert transport from the city to the dune base.",
      },
      {
        icon: "ticket",
        title: "Camel Trek",
        subtitle: "Sunset and sunrise camel rides through the Sahara.",
      },
    ],
    dailyItinerary: [
      {
        day: 1,
        activities: [
          {
            title: "Into the Sahara",
            description:
              "Departure in 4x4 vehicles towards the golden dunes of Merzouga.",
          },
          {
            title: "Sunset Camel Ride",
            description:
              "A peaceful trek across the dunes to watch the sun disappear over the horizon.",
          },
        ],
      },
      {
        day: 2,
        activities: [
          {
            title: "Berber Culture",
            description:
              "Visit a local nomadic family to learn about their traditions and enjoy Saharan tea.",
          },
        ],
      },
      {
        day: 3,
        activities: [
          {
            title: "Sunrise Peaks",
            description:
              "Early morning climb to the highest dune for a spectacular desert sunrise.",
          },
        ],
      },
    ],
  },
];

export interface AddOnIncluded {
  title: string;
}

export interface AddOnKnow {
  title: string;
  description: string;
  icon: string;
}

export interface AddOnItinerary {
  image: string;
  title: string;
  description: string;
}

export interface Review {
  name: string;
  username: string;
  date: string;
  rating: number;
  comment: string;
  avatar: string;
}

export interface AddOn {
  id: string;
  title: string;
  category: string;
  rating: number;
  reviewCount: number;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  featured?: boolean;
  included?: AddOnIncluded[];
  whatToKnow?: AddOnKnow[];
  itinerary?: AddOnItinerary[];
  reviews?: Review[];
}

export const ADD_ONS_FOR_YOU: AddOn[] = [
  {
    id: "1",
    title: "Exclusive Miami Sunset and City Lights Luxury Cocktail Cruise",
    category: "Food",
    rating: 4.5,
    reviewCount: 450,
    description:
      "Immerse yourself in a beautiful evening with a cocktail cruise. Enjoy the sunset and city lights as you sip on our signature cocktails. Perfect for a romantic evening or a relaxing night out with friends.",
    image: "https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=600",
    gallery: [
      "https://images.unsplash.com/photo-1544526226-d45680d0739f?w=600",
      "https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?w=600",
      "https://images.unsplash.com/photo-1518115392437-080168471e82?w=600",
      "https://images.unsplash.com/photo-1543160732-cf85659b7815?w=600",
      "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600",
      "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb56?w=600",
    ],
    price: 120,
    included: [
      { title: "Complimentary Signature Cocktails" },
      { title: "Luxury Yacht Access" },
      { title: "Live Music Performance" },
      { title: "Expert Local Commentary" },
    ],
    whatToKnow: [
      {
        icon: "clock",
        title: "Duration",
        description: "A 2-hour cruise through the bays of Miami.",
      },
      {
        icon: "user",
        title: "Guest Policy",
        description: "Open to all ages, though alcohol is 21+ only.",
      },
      {
        icon: "wind",
        title: "Weather Info",
        description: "Tours may be rescheduled in case of severe weather.",
      },
      {
        icon: "users",
        title: "Accessibility",
        description: "The yacht is wheelchair accessible with advance notice.",
      },
      {
        icon: "map-pin",
        title: "Parking",
        description: "Limited parking at marina; rideshare suggested.",
      },
    ],
    itinerary: [
      {
        image: "https://images.unsplash.com/photo-1544526226-d45680d0739f?w=600",
        title: "Marina Boarding",
        description: "Welcome drink upon boarding at the luxury marina.",
      },
      {
        image: "https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?w=600",
        title: "Skyline Sunset",
        description: "Panoramic views as the sun dips below the horizon.",
      },
      {
        image: "https://images.unsplash.com/photo-1518115392437-080168471e82?w=600",
        title: "Cocktails & Music",
        description: "Handcrafted drinks while mingling with fellow guests.",
      },
      {
        image: "https://images.unsplash.com/photo-1543160732-cf85659b7815?w=600",
        title: "City Lights Tour",
        description: "See the Miami skyline illuminate as night falls.",
      },
      {
        image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600",
        title: "Marina Return",
        description: "Smooth sail back to conclude the evening.",
      },
    ],
    reviews: [
      {
        name: "Alex Rivera",
        username: "@arivera",
        date: "2 days ago",
        rating: 5,
        comment: "The most beautiful way to see Miami. The cocktails were top notch!",
        avatar: "https://i.pravatar.cc/100?img=11",
      },
      {
        name: "Jessica W.",
        username: "@jess_travels",
        date: "5 days ago",
        rating: 4,
        comment: "Beautiful boat and great service. The music was a bit loud but the view was worth it.",
        avatar: "https://i.pravatar.cc/100?img=5",
      },
      {
        name: "David Smith",
        username: "@dsmith_miami",
        date: "1 week ago",
        rating: 5,
        comment: "Perfect for date night. The city lights from the water are incredible.",
        avatar: "https://i.pravatar.cc/100?img=12",
      },
      {
        name: "Maria L.",
        username: "@marial",
        date: "2 weeks ago",
        rating: 5,
        comment: "Lovely experience. The staff was very attentive and the drinks were delicious.",
        avatar: "https://i.pravatar.cc/100?img=10",
      },
      {
        name: "Ryan K.",
        username: "@ryank",
        date: "1 month ago",
        rating: 4,
        comment: "Great value for money. A must-do if you're in Miami for the weekend.",
        avatar: "https://i.pravatar.cc/100?img=13",
      },
    ],
  },
  {
    id: "2",
    title: "Premium Live Jazz and Exclusive Wine Tasting Night Experience",
    category: "Culture",
    rating: 4.8,
    reviewCount: 320,
    description:
      "Immerse yourself in a night of fantastic jazz music and wine pairing delights. Discover new flavors as our expert sommeliers guide you through a curated selection of fine wines perfectly matched with light bites.",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600",
    gallery: [
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600",
      "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600",
      "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600",
      "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=600",
      "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600",
    ],
    price: 80,
    included: [
      { title: "VIP Seating" },
      { title: "Selection of 5 Premium Wines" },
      { title: "Artisan Cheese & Charcuterie" },
      { title: "Professional Sommelier Guide" },
    ],
    whatToKnow: [
      {
        icon: "music",
        title: "Atmosphere",
        description: "Sophisticated jazz lounge setting.",
      },
      {
        icon: "user-check",
        title: "Dress Code",
        description: "Smart casual is required for entry.",
      },
      {
        icon: "alert-octagon",
        title: "Age Limit",
        description: "This event is strictly for guests aged 21 and over.",
      },
      {
        icon: "users",
        title: "Group Bookings",
        description: "Discounts available for groups of 6 or more.",
      },
      {
        icon: "clock",
        title: "Arrival Time",
        description: "Please arrive at least 15 minutes before the start.",
      },
    ],
    itinerary: [
      {
        image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600",
        title: "Opening Set",
        description: "Smooth evening jazz to set the mood.",
      },
      {
        image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600",
        title: "Sommelier Intro",
        description: "Brief talk on the evening's wine selection.",
      },
      {
        image: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600",
        title: "First Pour",
        description: "Enjoy the first wine with a matched appetizer.",
      },
      {
        image: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=600",
        title: "Main Jazz Set",
        description: "The band takes the stage for their performance.",
      },
      {
        image: "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600",
        title: "Digestif",
        description: "Conclude with a sweet treat and final tasting.",
      },
    ],
    reviews: [
      {
        name: "Elena G.",
        username: "@elenag_tunes",
        date: "5 days ago",
        rating: 4,
        comment: "Great music, even better wine. Highly recommend for a relaxed night.",
        avatar: "https://i.pravatar.cc/100?img=20",
      },
      {
        name: "Marcus T.",
        username: "@marcus_jazz",
        date: "1 week ago",
        rating: 5,
        comment: "An incredible evening. The sommelier really knew their stuff.",
        avatar: "https://i.pravatar.cc/100?img=15",
      },
      {
        name: "Sarah Jenkins",
        username: "@sjenkins",
        date: "2 weeks ago",
        rating: 5,
        comment: "The atmosphere was electric! Best jazz club experience in the city.",
        avatar: "https://i.pravatar.cc/100?img=22",
      },
      {
        name: "Leo P.",
        username: "@leop",
        date: "3 weeks ago",
        rating: 4,
        comment: "Wonderful wine selection. I wish the set was a bit longer, but overall great.",
        avatar: "https://i.pravatar.cc/100?img=18",
      },
      {
        name: "Nina R.",
        username: "@ninar",
        date: "1 month ago",
        rating: 5,
        comment: "A sophisticated night out. The food pairings were spot on.",
        avatar: "https://i.pravatar.cc/100?img=25",
      },
    ],
  },
  {
    id: "3",
    title: "Private 30-Minute VIP Helicopter Tour of the Stunning Coastline",
    category: "Adventure",
    rating: 4.9,
    reviewCount: 38,
    description:
      "See the stunning coastline from above in an unforgettable 30-minute helicopter ride. Take in breathtaking panoramic views of pristine beaches, dramatic cliffs, and crystal-clear waters from a unique vantage point.",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600",
    gallery: [
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600",
      "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600",
      "https://images.unsplash.com/photo-1620067925093-801122da1688?w=600",
      "https://images.unsplash.com/photo-1546500840-ae38253aba9b?w=600",
      "https://images.unsplash.com/photo-1591154117099-0fac39b6b718?w=600",
      "https://images.unsplash.com/photo-1560677353-c99026be15ea?w=600",
    ],
    price: 250,
    included: [
      { title: "Private Helicopter Flight" },
      { title: "Noise-Canceling Headsets" },
      { title: "Pre-Flight Briefing" },
      { title: "Digital Souvenir Photo" },
    ],
    whatToKnow: [
      {
        icon: "camera",
        title: "Photo Opps",
        description: "Endless views of the shoreline perfect for photography.",
      },
      {
        icon: "activity",
        title: "Weight Limits",
        description: "Maximum weight per seat is 250 lbs for safety.",
      },
      {
        icon: "alert-circle",
        title: "Motion Sickness",
        description: "If sensitive, we recommend taking precautions.",
      },
      {
        icon: "file-text",
        title: "ID Required",
        description: "Valid photo identification must be presented.",
      },
      {
        icon: "users",
        title: "Children",
        description: "Children must be accompanied by an adult.",
      },
    ],
    itinerary: [
      {
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600",
        title: "Liftoff",
        description: "Ascend from the helipad for an aerial tour.",
      },
      {
        image: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600",
        title: "Safety Briefing",
        description: "Essential safety instructions and headset fitting.",
      },
      {
        image: "https://images.unsplash.com/photo-1620067925093-801122da1688?w=600",
        title: "Coastal Cruise",
        description: "Fly over the most iconic beaches and cliffs.",
      },
      {
        image: "https://images.unsplash.com/photo-1546500840-ae38253aba9b?w=600",
        title: "Scenic Hover",
        description: "A brief hover at the most scenic point for photos.",
      },
      {
        image: "https://images.unsplash.com/photo-1591154117099-0fac39b6b718?w=600",
        title: "Landing",
        description: "Safe return to base and a chance to meet the pilot.",
      },
    ],
    reviews: [
      {
        name: "Mark J.",
        username: "@mark_adventures",
        date: "1 month ago",
        rating: 5,
        comment: "Absolutely breathtaking. Worth every penny!",
        avatar: "https://i.pravatar.cc/100?img=33",
      },
      {
        name: "Chris Evans",
        username: "@cevans",
        date: "2 months ago",
        rating: 5,
        comment: "The pilot was great and the views of the coast were unmatched.",
        avatar: "https://i.pravatar.cc/100?img=32",
      },
      {
        name: "Sophie L.",
        username: "@sophiel",
        date: "3 months ago",
        rating: 5,
        comment: "A once-in-a-lifetime experience. Highly professional staff.",
        avatar: "https://i.pravatar.cc/100?img=30",
      },
      {
        name: "Tom H.",
        username: "@tomh",
        date: "4 months ago",
        rating: 4,
        comment: "Great tour! It was a bit short, but we saw a lot in 30 minutes.",
        avatar: "https://i.pravatar.cc/100?img=35",
      },
      {
        name: "Emma W.",
        username: "@emmaw",
        date: "5 months ago",
        rating: 5,
        comment: "I've never seen the coastline like this before. Stunning!",
        avatar: "https://i.pravatar.cc/100?img=31",
      },
    ],
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
    reviewCount: 120,
    description:
      "Capture the ethereal beauty of the Northern Lights with professional guidance. We'll take you to the best spots and help you dial in your camera settings for that perfect celestial shot.",
    image: "https://images.unsplash.com/photo-1483347756191-d5efbf27670e?w=600",
    gallery: [
      "https://images.unsplash.com/photo-1571839031920-f19956dfcd38?w=600",
      "https://images.unsplash.com/photo-1541414779316-956a5084c0d4?w=600",
      "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?w=600",
      "https://images.unsplash.com/photo-1510211334416-4919ff3a0e72?w=600",
      "https://images.unsplash.com/photo-1524311583145-d3593002636a?w=600",
      "https://images.unsplash.com/photo-1533470586079-24827adb828c?w=600",
    ],
    price: 150,
    included: [
      { title: "DSLR Settings Guide" },
      { title: "Night Photography Tutorial" },
      { title: "Expert Navigator for Aurora Spotting" },
      { title: "Warm Beverages & Snacks" },
    ],
    whatToKnow: [
      {
        icon: "thermometer",
        title: "Attire",
        description: "Extreme cold weather gear is recommended.",
      },
      {
        icon: "eye",
        title: "Visibility",
        description: "Aurora visibility depends on weather and activity.",
      },
      {
        icon: "map-pin",
        title: "Pick-up",
        description: "Meeting point is at the city center hotel lobby.",
      },
      {
        icon: "activity",
        title: "Physical Level",
        description: "Low, mostly standing and short walks in snow.",
      },
      {
        icon: "briefcase",
        title: "Gear",
        description: "We provide thermal suits and tripods.",
      },
    ],
    itinerary: [
      {
        image: "https://images.unsplash.com/photo-1483347756191-d5efbf27670e?w=600",
        title: "Equipment Setup",
        description: "Calibrating cameras for low-light conditions.",
      },
      {
        image: "https://images.unsplash.com/photo-1571839031920-f19956dfcd38?w=600",
        title: "Location Scout",
        description: "We head to the best spot based on clear skies.",
      },
      {
        image: "https://images.unsplash.com/photo-1541414779316-956a5084c0d4?w=600",
        title: "Aurora Watching",
        description: "Wait for the lights while enjoying hot drinks.",
      },
      {
        image: "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?w=600",
        title: "Photo Coaching",
        description: "Hands-on help to capture the perfect aurora shot.",
      },
      {
        image: "https://images.unsplash.com/photo-1510211334416-4919ff3a0e72?w=600",
        title: "Arctic Return",
        description: "Journey back with a memory full of photos.",
      },
    ],
    reviews: [
      {
        name: "Lydia P.",
        username: "@lp_photos",
        date: "4 days ago",
        rating: 5,
        comment: "The guide knew exactly where to go. Got some amazing shots!",
        avatar: "https://i.pravatar.cc/100?img=41",
      },
      {
        name: "Peter M.",
        username: "@peterm",
        date: "1 week ago",
        rating: 5,
        comment: "A magical experience. The lights were so bright and vibrant.",
        avatar: "https://i.pravatar.cc/100?img=38",
      },
      {
        name: "Alice K.",
        username: "@alicek",
        date: "2 weeks ago",
        rating: 5,
        comment: "Best photography tour I've ever been on. Very informative.",
        avatar: "https://i.pravatar.cc/100?img=42",
      },
      {
        name: "James F.",
        username: "@jamesf",
        date: "3 weeks ago",
        rating: 4,
        comment: "Incredible views. It was freezing cold, but worth the wait.",
        avatar: "https://i.pravatar.cc/100?img=40",
      },
      {
        name: "Hannah S.",
        username: "@hannahs",
        date: "1 month ago",
        rating: 5,
        comment: "Truly unforgettable. The aurora borealis is a must-see.",
        avatar: "https://i.pravatar.cc/100?img=43",
      },
    ],
  },
  {
    id: "h2",
    title: "Traditional Kaiseki Dining Experience in a Hidden Kyoto Gion",
    category: "Food",
    rating: 5.0,
    reviewCount: 85,
    description:
      "Multi-course haute cuisine that balances taste, texture, and appearance. Experience the pinnacle of Japanese culinary art in an intimate, historic setting.",
    image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600",
    gallery: [
      "https://images.unsplash.com/photo-1558818498-28c3e00ad465?w=600",
      "https://images.unsplash.com/photo-1464306311821-582962a9ca64?w=600",
      "https://images.unsplash.com/photo-1514333912423-e9b5ec1ff21d?w=600",
      "https://images.unsplash.com/photo-1552590635-27c2c2128b15?w=600",
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600",
      "https://images.unsplash.com/photo-1464306311821-582962a9ca64?w=600",
    ],
    price: 320,
    included: [
      { title: "12-Course Kaiseki Dinner" },
      { title: "Private Dining Room" },
      { title: "Tea Ceremony Introduction" },
      { title: "Maiko Performance (Optional)" },
    ],
    whatToKnow: [
      {
        icon: "info",
        title: "Etiquette",
        description: "Formal attire and shoe removal required.",
      },
      {
        icon: "utensils",
        title: "Dietary Needs",
        description: "Please inform us of allergies 48h early.",
      },
      {
        icon: "users",
        title: "Seating",
        description: "Traditional floor seating; leg space available.",
      },
      {
        icon: "volume-x",
        title: "Quietude",
        description: "Maintain a peaceful, respectful atmosphere.",
      },
      {
        icon: "camera",
        title: "Photography",
        description: "Discreet photography allowed; avoid flash.",
      },
    ],
    itinerary: [
      {
        image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600",
        title: "Gion Walk",
        description: "Short guided walk through the historic district.",
      },
      {
        image: "https://images.unsplash.com/photo-1558818498-28c3e00ad465?w=600",
        title: "Seasonal Prelude",
        description: "First courses reflecting the current season.",
      },
      {
        image: "https://images.unsplash.com/photo-1464306311821-582962a9ca64?w=600",
        title: "Main Courses",
        description: "Fresh seafood at the heart of the Kaiseki meal.",
      },
      {
        image: "https://images.unsplash.com/photo-1514333912423-e9b5ec1ff21d?w=600",
        title: "Rice & Miso",
        description: "Traditional ritual towards the end of the meal.",
      },
      {
        image: "https://images.unsplash.com/photo-1552590635-27c2c2128b15?w=600",
        title: "Matcha Ceremony",
        description: "Conclude with a calming cup of whisked green tea.",
      },
    ],
    reviews: [
      {
        name: "Hiroshi K.",
        username: "@hiro_foodie",
        date: "2 weeks ago",
        rating: 5,
        comment: "The most authentic meal I've ever had. Truly special.",
        avatar: "https://i.pravatar.cc/100?img=52",
      },
      {
        name: "Yuki M.",
        username: "@yukim",
        date: "1 month ago",
        rating: 5,
        comment: "Exceptional dining. The presentation was like a work of art.",
        avatar: "https://i.pravatar.cc/100?img=48",
      },
      {
        name: "Kenji T.",
        username: "@kenjit",
        date: "2 months ago",
        rating: 5,
        comment: "A masterpiece of Japanese cuisine. Highly recommend.",
        avatar: "https://i.pravatar.cc/100?img=49",
      },
      {
        name: "Maya R.",
        username: "@mayar",
        date: "3 months ago",
        rating: 5,
        comment: "The seasonal flavors were incredible. A must-visit in Kyoto.",
        avatar: "https://i.pravatar.cc/100?img=50",
      },
      {
        name: "Liam O.",
        username: "@liamo",
        date: "4 months ago",
        rating: 5,
        comment: "Amazing food and wonderful service. A truly unforgettable night.",
        avatar: "https://i.pravatar.cc/100?img=51",
      },
    ],
  },
  {
    id: "h3",
    title: "Sunrise Hot Air Balloon Ride Over Cappadocia's Fairy Chimneys",
    category: "Adventure",
    rating: 4.9,
    reviewCount: 412,
    description:
      "Float gently over the surreal landscapes of Cappadocia as the sun rises. A magical perspective of Turkey's unique volcanic formations and ancient cave dwellings.",
    image: "https://images.unsplash.com/photo-1527838832700-505925240cff?w=600",
    gallery: [
      "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=600",
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600",
      "https://images.unsplash.com/photo-1534050359320-02900022671e?w=600",
      "https://images.unsplash.com/photo-1516733729877-24760dc0cc14?w=600",
      "https://images.unsplash.com/photo-1525097487452-6411ffdf6ad2?w=600",
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600",
    ],
    price: 280,
    included: [
      { title: "Sunrise Flight" },
      { title: "Traditional Champagne Breakfast" },
      { title: "Flight Certificate" },
      { title: "Pickup from Hotel" },
    ],
    whatToKnow: [
      {
        icon: "alert-circle",
        title: "Safety",
        description: "Subject to wind conditions. Safety first.",
      },
      {
        icon: "thermometer",
        title: "Morning Cold",
        description: "Dress warmly; it is chilly before sunrise.",
      },
      {
        icon: "clock",
        title: "Flight Time",
        description: "Actual flight time is approximately 60 minutes.",
      },
      {
        icon: "users",
        title: "Requirements",
        description: "Min age 6 years; must be at least 120cm tall.",
      },
      {
        icon: "refresh-cw",
        title: "Cancellation",
        description: "Full refund if grounded by the pilot.",
      },
    ],
    itinerary: [
      {
        image: "https://images.unsplash.com/photo-1527838832700-505925240cff?w=600",
        title: "Inflation Watch",
        description: "See the massive balloons come to life at dawn.",
      },
      {
        image: "https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=600",
        title: "Lift Off",
        description: "Gently rise above the fairy chimneys as light breaks.",
      },
      {
        image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600",
        title: "Grand Flight",
        description: "Drift across the valley for breathtaking panoramas.",
      },
      {
        image: "https://images.unsplash.com/photo-1534050359320-02900022671e?w=600",
        title: "Toast",
        description: "Soft landing followed by a champagne celebration.",
      },
      {
        image: "https://images.unsplash.com/photo-1516733729877-24760dc0cc14?w=600",
        title: "Certificates",
        description: "Receive your certificate before the hotel drop-off.",
      },
    ],
    reviews: [
      {
        name: "Chloe M.",
        username: "@chloe_sky",
        date: "1 day ago",
        rating: 5,
        comment: "Dream come true. Cappadocia looks unreal from above.",
        avatar: "https://i.pravatar.cc/100?img=47",
      },
      {
        name: "Lucas B.",
        username: "@lucasb",
        date: "3 days ago",
        rating: 5,
        comment: "Breath-taking views. The sunrise was absolutely stunning.",
        avatar: "https://i.pravatar.cc/100?img=46",
      },
      {
        name: "Isabella S.",
        username: "@isabellas",
        date: "1 week ago",
        rating: 5,
        comment: "Such a magical morning. Everything was so well-organized.",
        avatar: "https://i.pravatar.cc/100?img=45",
      },
      {
        name: "Oliver W.",
        username: "@oliverw",
        date: "2 weeks ago",
        rating: 5,
        comment: "One of the best experiences of my life. A must-do in Turkey.",
        avatar: "https://i.pravatar.cc/100?img=44",
      },
      {
        name: "Sophia L.",
        username: "@sophial",
        date: "1 month ago",
        rating: 5,
        comment: "Simply amazing. The views were unforgettable.",
        avatar: "https://i.pravatar.cc/100?img=41",
      },
    ],
  },
  {
    id: "h4",
    title: "Scuba Diving in Key Largo",
    category: "Diving",
    rating: 4.9,
    reviewCount: 211,
    description:
      "Dive into the crystal-clear waters of Key Largo and explore vibrant coral reefs teeming with marine life. Perfect for both beginners and experienced divers, this underwater adventure offers an unforgettable glimpse into a hidden world of natural wonder.",
    image: "https://images.unsplash.com/photo-1544551763-47a012972986?w=600",
    gallery: [
      "https://images.unsplash.com/photo-1682687196011-04203ae355b2?w=600",
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600",
      "https://images.unsplash.com/photo-1544551763-47a012972986?w=600",
      "https://images.unsplash.com/photo-1629236209376-7ca656093144?w=600",
      "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600",
      "https://images.unsplash.com/photo-1620067925093-801122da1688?w=600",
      "https://images.unsplash.com/photo-1546500840-ae38253aba9b?w=600",
      "https://images.unsplash.com/photo-1591154117099-0fac39b6b718?w=600",
      "https://images.unsplash.com/photo-1560677350-59060f1df7ef?w=600",
      "https://images.unsplash.com/photo-1454789476702-d20335171882?w=600",
      "https://images.unsplash.com/photo-1543160732-cf85659b7815?w=600",
      "https://images.unsplash.com/photo-1518115392437-080168471e82?w=600",
      "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600",
      "https://images.unsplash.com/photo-1588145450821-26792694586e?w=600",
      "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=600",
      "https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600",
      "https://images.unsplash.com/photo-1466067111913-b21bb01382b6?w=600",
      "https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?w=600",
      "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600",
      "https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=600",
      "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=600",
      "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=600",
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=600",
      "https://images.unsplash.com/photo-1560677353-c99026be15ea?w=600",
      "https://images.unsplash.com/photo-1582967788647-9799298716cc?w=600",
      "https://images.unsplash.com/photo-1459749411177-042180ec75fa?w=600",
      "https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb56?w=600",
      "https://images.unsplash.com/photo-1483347756191-d5efbf27670e?w=600",
      "https://images.unsplash.com/photo-1466611653911-954554331f4a?w=600",
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600",
      "https://images.unsplash.com/photo-1544552868-8004f81014cc?w=600",
      "https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?w=600",
      "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=600",
    ],
    price: 200,
    included: [
      { title: "Hotel Pickup and Dropoff" },
      { title: "All the equipments you need" },
      { title: "1-1 Instructor" },
      { title: "Personalized Itineraries Available" },
    ],
    whatToKnow: [
      {
        icon: "users",
        title: "Requirements",
        description: "Open to all swimmers; no prior diving experience needed.",
      },
      {
        icon: "activity",
        title: "Activity Level",
        description: "Moderate activity; involves swimming and equipment handling.",
      },
      {
        icon: "life-buoy",
        title: "Safety First",
        description: "Fully certified instructors guide every step of the dive.",
      },
      {
        icon: "camera",
        title: "Underwater Photos",
        description: "GoPro rentals available for capturing your dive.",
      },
      {
        icon: "thermometer-snow",
        title: "Water Temp",
        description: "Wetsuits provided for a comfortable experience.",
      },
    ],
    itinerary: [
      {
        image: "https://images.unsplash.com/photo-1544551763-47a012972986?w=600",
        title: "Briefing",
        description: "Safety walk-through and equipment fitting at the center.",
      },
      {
        image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600",
        title: "Boat Trip",
        description: "A scenic boat ride to the designated reef location.",
      },
      {
        image: "https://images.unsplash.com/photo-1544551763-47a012972986?w=600",
        title: "First Dive",
        description: "Descend into the reef for your first underwater scout.",
      },
      {
        image: "https://images.unsplash.com/photo-1629236209376-7ca656093144?w=600",
        title: "Marine Life",
        description: "Encounter tropical fish, turtles, and colorful corals.",
      },
      {
        image: "https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600",
        title: "Surface Break",
        description: "Relax on board with snacks before the return trip.",
      },
    ],
    reviews: [
      {
        name: "Samantha Cruz",
        username: "@samantha.cruz",
        date: "3 days ago",
        rating: 4,
        comment:
          "Just enjoyed a stunning sunset on the Miami Sunset Cocktail Cruise! The colors in the sky were mesmerizing.",
        avatar: "https://i.pravatar.cc/100?img=1",
      },
      {
        name: "Michael Chen",
        username: "@mchen.travels",
        date: "1 week ago",
        rating: 5,
        comment:
          "The best diving experience I've had in the Florida Keys. The reefs are incredibly vibrant and full of life!",
        avatar: "https://i.pravatar.cc/100?img=3",
      },
      {
        name: "Emily R.",
        username: "@emilyr",
        date: "2 weeks ago",
        rating: 5,
        comment: "Key Largo has some of the best diving spots. This tour was top-notch.",
        avatar: "https://i.pravatar.cc/100?img=4",
      },
      {
        name: "Jason B.",
        username: "@jasonb",
        date: "3 weeks ago",
        rating: 5,
        comment: "Incredible marine life. Saw turtles, rays, and so many colorful fish.",
        avatar: "https://i.pravatar.cc/100?img=8",
      },
      {
        name: "Olivia K.",
        username: "@oliviak",
        date: "1 month ago",
        rating: 5,
        comment: "A fantastic underwater adventure. Highly recommended for divers.",
        avatar: "https://i.pravatar.cc/100?img=2",
      },
    ],
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
