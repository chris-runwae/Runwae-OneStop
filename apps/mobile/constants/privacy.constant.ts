export const TRIP_VISIBILITY_OPTIONS = [
  {
    label: "Public",
    value: "public",
    subtitle: "Anyone can see your trip details.",
  },
  {
    label: "Private",
    value: "private",
    subtitle: "Visible only to your followers and following.",
  },
  {
    label: "Friends Only",
    value: "friends",
    subtitle: "Visible only to your following.",
  },
  {
    label: "Custom",
    value: "custom",
    subtitle: "Customize your privacy settings per trip",
  },
];

export const PRIVACY_SECTIONS_METADATA = [
  {
    title: "Account Visibility",
    items: [
      {
        id: "profilePublic",
        label: "Public Profile",
        description: "Allow anyone to see your profile and ratings.",
      },
      {
        id: "showBadges",
        label: "Display Badges",
        description: "Show achievement badges on your profile.",
      },
    ],
  },
  {
    title: "Discoverability",
    items: [
      {
        id: "findByName",
        label: "Find by Name",
        description: "Allow people to search for you by your full name.",
      },
      {
        id: "findByEmail",
        label: "Find by Email",
        description: "Allow people to find your account using your email.",
      },
    ],
  },
  {
    title: "Data & Activity",
    items: [
      {
        id: "shareActivity",
        label: "Share Activity Status",
        description: "Show when you're online or on a trip.",
      },
      {
        id: "analyticsEnabled",
        label: "Usage Analytics",
        description: "Help us improve by sharing anonymous usage data.",
      },
      {
        id: "personalizedAds",
        label: "Personalized Experience",
        description: "Allow us to tailor suggestions based on your activity.",
      },
    ],
  },
];
