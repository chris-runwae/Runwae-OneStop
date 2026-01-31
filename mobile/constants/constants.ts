import { HomeIcon, PlaneIcon, SearchIcon } from '@/components/icons';
import { Tab } from '@/types';
import { User } from 'lucide-react-native';

const ORIENTATION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

export const ICON_NAMES = {
  BELL: 'bell',
  ARROW_LEFT: 'arrow-left',
  ARROW_RIGHT: 'arrow-right',
  // ...more icons
} as const;

export type IconNameType = (typeof ICON_NAMES)[keyof typeof ICON_NAMES];

export interface SuggestedItinerary {
  id: string;
  title: string;
  location: string;
  image: any;
}

const SUGGESTED_ITINERARIES: SuggestedItinerary[] = [
  {
    id: '1',
    title: 'FIFA World Cup 2026',
    location: 'New York, USA',
    image:
      'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80',
    // 🏟️ Football stadium lights
  },
  {
    id: '2',
    title: 'Lake Como',
    location: 'Como, Italy',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    // 🌅 Classic Lake Como panorama
  },
  {
    id: '3',
    title: 'Christmas @ Time Square',
    location: 'New York, USA',
    image:
      'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80',
    // 🎄 Times Square during winter
  },
  {
    id: '4',
    title: 'Santorini Sunset',
    location: 'Santorini, Greece',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    // 🌇 Iconic Santorini sunset with blue domes
  },
];

export const constants = {
  ORIENTATION,
  ...ORIENTATION,
  ...ICON_NAMES,
  SUGGESTED_ITINERARIES,
};

export const tabs: Tab[] = [
  {
    name: 'index',
    title: 'Home',
    icon: HomeIcon,
    route: '/',
  },
  {
    name: 'explore',
    title: 'Explore',
    icon: SearchIcon,
    route: '/explore',
  },
  {
    name: 'trips',
    title: 'Trips',
    icon: PlaneIcon,
    route: '/trips',
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: User,
    route: '/profile',
  },
];
