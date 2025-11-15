export const surveyData = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'Runwae',
    description:
      'Discover breathtaking destinations and embark on unforgettable travel adventures around the world.',
    //can not decide on image
    // image:
    //   'https://images.pexels.com/photos/2265876/pexels-photo-2265876.jpeg?cs=srgb&dl=pexels-vince-2265876.jpg',
    image:
      'https://images.pexels.com/photos/127905/pexels-photo-127905.jpeg?auto=compress&cs=tinysrgb&w=1200.jpg',
  },
  {
    id: 'travel-experience',
    type: 'multiple-choice',
    question: 'How would you describe your travel experience?',
    options: [
      { id: 'beginner', text: 'First-time Traveler', icon: '🧳' },
      { id: 'intermediate', text: 'Casual Explorer', icon: '🌍' },
      { id: 'expert', text: 'Seasoned Globetrotter', icon: '✈️' },
    ],
  },
  // {
  //   id: 'reason-for-runwae',
  //   type: 'multiple-select',
  //   question: 'What brings you to Runwae?',
  //   description:
  //     'Let’s set the tone for your experience. What do you want to do here?',
  //   options: [
  //     { id: 'events', text: 'Events and Experiences', icon: '🎟️' },
  //     { id: 'planning', text: 'Planning my trips', icon: '📝' },
  //     { id: 'socialize', text: 'Socialize with travelers', icon: '🤝' },
  //     { id: 'learning', text: 'Learn about new destinations', icon: '📚' },
  //   ],
  // },
  {
    id: 'goals',
    type: 'multiple-select',
    question: 'What brings you to Runwae?',
    description:
      'Let’s set the tone for your experience. What do you want to do here? Select all that apply.',
    options: [
      { id: 'discover', text: 'Discover new places', icon: '🗺️' },
      { id: 'plan', text: 'Plan my trips', icon: '📝' },
      { id: 'connect', text: 'Connect with travelers', icon: '🤝' },
      { id: 'learn', text: 'Learn travel tips', icon: '📚' },
    ],
  },
  {
    id: 'event-preferences',
    type: 'multiple-select',
    question: 'What type of events are you most interested in?',
    description:
      'Pick your scene so we can show you the best of the best only.',
    options: [
      { id: 'music-festivals', text: 'Music Festivals', icon: '🎵' },
      { id: 'arts-culture', text: 'Arts & Culture', icon: '🎭' },
      { id: 'nightlife', text: 'Nightlife', icon: '🎉' },
      { id: 'conferences', text: 'Conferences', icon: '💼' },
      { id: 'exhibitions', text: 'Exhibitions', icon: '🖼️' },
      { id: 'sports-games', text: 'Sports & Games', icon: '⚽' },
      { id: 'talks-workshops', text: 'Talks & Workshops', icon: '💬' },
      { id: 'wellness-retreats', text: 'Wellness & Retreats', icon: '🧘' },
      { id: 'food-drink', text: 'Food & Drink', icon: '🍽️' },
      { id: 'gaming-esports', text: 'Gaming & Esports', icon: '🎮' },
    ],
  },
  {
    id: 'frequency',
    type: 'multiple-choice',
    question: 'How often do you travel?',
    options: [
      { id: 'monthly', text: 'Every month', icon: '📆' },
      { id: 'quarterly', text: 'A few times a year', icon: '🌤️' },
      { id: 'yearly', text: 'Once a year', icon: '🗓️' },
      { id: 'rarely', text: 'Rarely', icon: '😌' },
    ],
  },
  {
    id: 'travel-with',
    type: 'multiple-select',
    question: 'Who do you usually travel with?',
    description: 'Select all that apply',
    options: [
      { id: 'solo', text: 'Solo', icon: '😊' },
      { id: 'couple', text: 'Partner', icon: '❤️' },
      { id: 'friends', text: 'Friends', icon: '👯' },
      { id: 'family', text: 'Family', icon: '🧑‍🧑‍🧒‍🧒' },
      { id: 'business', text: 'Business', icon: '💼' },
      { id: 'other', text: 'Other', icon: '👥' },
    ],
  },
  {
    id: 'premium-features',
    type: 'features',
    title: 'Runwae Premium',
    description:
      'Elevate your journeys with exclusive travel tools and insights',
    features: [
      { text: 'Personalized itinerary planning', icon: '🗒️' },
      { text: 'Real-time travel alerts', icon: '🚨' },
      { text: 'Local experience recommendations', icon: '🍽️' },
      { text: 'Expense tracking & budgeting', icon: '💸' },
      { text: 'Travel journal & photo storage', icon: '📸' },
    ],
  },
];
