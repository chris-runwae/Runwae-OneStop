export const surveyData = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'Runwae',
    description:
      'A few quick questions so we can tailor trips, suggestions and group tools to how you actually travel.',
    image:
      'https://images.unsplash.com/photo-1527605158555-853f200063e9?q=80&w=971&auto=format&fit=crop',
  },
  {
    id: 'travel-party',
    type: 'multiple-select',
    question: 'How do you usually travel?',
    description:
      "We'll use this to suggest the right group sizes and trip types.",
    options: [
      {
        id: 'crew',
        text: 'With a crew',
        subtext: 'Friends or family groups',
        icon: '👥',
      },
      {
        id: 'couple',
        text: 'As a couple',
        subtext: 'Just the two of us',
        icon: '❤️',
      },
      { id: 'solo', text: 'Solo', subtext: 'I plan, others join', icon: '🧍' },
      {
        id: 'work',
        text: 'Work trips',
        subtext: 'Team retreats & offsites',
        icon: '💼',
      },
    ],
  },
  {
    id: 'travel-style',
    type: 'multiple-choice',
    question: "What's your travel style?",
    description: 'Pick the one that sounds most like you.',
    options: [
      {
        id: 'planner',
        text: 'Planner',
        subtext: 'Itinerary locked weeks ahead',
        icon: '📋',
      },
      {
        id: 'spontaneous',
        text: 'Spontaneous',
        subtext: 'Wing it, figure it out there',
        icon: '💨',
      },
      {
        id: 'flexible',
        text: 'Flexible',
        subtext: 'Loose plan, open to changes',
        icon: '⚖️',
      },
      {
        id: 'experience',
        text: 'Experience-first',
        subtext: 'Activities over logistics',
        icon: '⭐',
      },
    ],
  },
  {
    id: 'trip-types',
    type: 'multiple-select',
    question: 'What kind of trips do you go on?',
    description: 'Select all that apply.',
    options: [
      { id: 'beach', text: 'Beach & sun', icon: '🏖️' },
      { id: 'city', text: 'City breaks', icon: '🏙️' },
      { id: 'adventure', text: 'Adventure & hiking', icon: '🏔️' },
      { id: 'food', text: 'Food & culture', icon: '🍽️' },
      { id: 'festivals', text: 'Festivals & events', icon: '🎶' },
      { id: 'wellness', text: 'Wellness & retreats', icon: '🧘' },
    ],
  },
  {
    id: 'pain-point',
    type: 'multiple-choice',
    question: "What's the biggest headache when planning with a group?",
    description: 'Pick the one that stings the most.',
    options: [
      {
        id: 'costs',
        text: 'Splitting costs fairly',
        subtext: 'Who owes who, and for what',
        icon: '💸',
      },
      {
        id: 'dates',
        text: 'Agreeing on dates',
        subtext: "Nobody's availability ever lines up",
        icon: '📆',
      },
      {
        id: 'comms',
        text: 'Keeping everyone in the loop',
        subtext: 'Too many chats, lost decisions',
        icon: '💬',
      },
      {
        id: 'decisions',
        text: "Making decisions everyone's happy with",
        subtext: 'Too many opinions, too little progress',
        icon: '😤',
      },
    ],
  },
  {
    id: 'planning-horizon',
    type: 'multiple-choice',
    question: 'How far ahead do you usually start planning?',
    description: 'This helps us time reminders and suggestions right.',
    options: [
      {
        id: 'last-minute',
        text: 'Last minute',
        subtext: 'Days or a week before',
        icon: '⚡',
      },
      {
        id: 'one-month',
        text: 'A month out',
        subtext: 'Enough time to figure it out',
        icon: '🕐',
      },
      {
        id: 'two-three',
        text: '2–3 months',
        subtext: 'Gives everyone time to save',
        icon: '📅',
      },
      {
        id: 'six-plus',
        text: '6+ months',
        subtext: 'Full planner mode',
        icon: '🗓️',
      },
    ],
  },
  {
    id: 'runwae-features',
    type: 'features',
    title: "You're all set 🎉",
    description: "Here's what Runwae unlocks for you.",
    features: [
      {
        text: 'AI itinerary builder',
        subtext: 'Generate a full trip plan from a link, idea, or prompt',
        icon: '🗺️',
      },
      {
        text: 'Group coordination tools',
        subtext: 'Polls, availability, shared decisions — all in one place',
        icon: '👥',
      },
      {
        text: 'Cost splitting & tracking',
        subtext: 'Track who paid what and settle up easily',
        icon: '🧾',
      },
      {
        text: 'Book activities & hotels',
        subtext: 'Viator experiences and stays, direct from the app',
        icon: '🏨',
      },
    ],
  },
];
