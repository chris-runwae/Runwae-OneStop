export const surveyData = [
  {
    id: 'welcome',
    type: 'welcome',
    title: 'Runwae',
    description: 'Plan your next adventure',
    // image: 'https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg',
    image:
      'https://images.unsplash.com/photo-1527605158555-853f200063e9?q=80&w=971&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    id: 'plant-experience',
    type: 'multiple-choice',
    question: 'How would you describe your plant care skills?',
    options: [
      { id: 'beginner', text: 'Plant Beginner', icon: '🌱' },
      { id: 'intermediate', text: 'Casual Gardener', icon: '🪴' },
      { id: 'expert', text: 'Botanical Enthusiast', icon: '🌳' },
    ],
  },
  {
    id: 'plant-types',
    type: 'multiple-select',
    question: 'What types of plants do you have in your collection?',
    description: 'Select all that apply',
    options: [
      { id: 'tropical', text: 'Tropical Houseplants', icon: '🌴' },
      { id: 'flowering', text: 'Flowering Plants', icon: '🌺' },
      { id: 'succulents', text: 'Cacti & Succulents', icon: '🌵' },
      { id: 'vegetables', text: 'Vegetables & Herbs', icon: '🥬' },
      { id: 'bonsai', text: 'Bonsai & Ornamentals', icon: '🎍' },
    ],
  },
  {
    id: 'goals',
    type: 'multiple-choice',
    question: 'What do you hope to achieve with PlantPal?',
    options: [
      { id: 'monitor', text: 'Monitor plant health', icon: '🔎' },
      { id: 'troubleshoot', text: 'Troubleshoot plant problems', icon: '🔧' },
      { id: 'optimize', text: 'Optimize growing conditions', icon: '☀️' },
      { id: 'expand', text: 'Expand my plant knowledge', icon: '🧠' },
    ],
  },
  {
    id: 'frequency',
    type: 'multiple-choice',
    question: 'How often do you tend to your plants?',
    options: [
      { id: 'daily', text: 'Every day', icon: '🌞' },
      { id: 'weekly', text: 'A few times a week', icon: '📅' },
      { id: 'biweekly', text: 'Every couple of weeks', icon: '🗓️' },
      { id: 'whenever', text: 'When I remember to', icon: '💭' },
    ],
  },
  {
    id: 'premium-features',
    type: 'features',
    title: 'PlantPal Premium',
    description: 'Elevate your plant care with advanced AI-powered features',
    features: [
      { text: 'Custom watering & fertilizing schedules', icon: '💧' },
      { text: 'Early disease detection & prevention', icon: '🦠' },
      { text: 'Seasonal care adjustments & reminders', icon: '🍂' },
      { text: 'Light & humidity optimization', icon: '☀️' },
      { text: 'Plant growth milestones & journaling', icon: '📈' },
    ],
  },
];
