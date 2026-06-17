export interface WalletBalance {
  available: number;
  pending: number;
  lifetime: number;
  currency: string;
}

export interface LinkedCard {
  id: string;
  lastFour: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'other';
  isActive: boolean;
}

export interface RewardItem {
  id: string;
  description: string;
  type: 'cashback' | 'discount' | 'perk';
  value: string;
  emoji: string;
}

export interface EventReward {
  id: string;
  eventId: string;
  eventName: string;
  eventEmoji: string;
  rewards: RewardItem[];
  expiresAt?: number;
}

export interface MerchantOffer {
  id: string;
  name: string;
  category: string;
  rewardValue: string;
  rewardType: 'cashback' | 'discount' | 'perk';
  imageUrl: string;
  eventId?: string;
  eventName?: string;
  description?: string;
  terms?: string;
  address?: string;
  isNearby?: boolean;
}

export interface RewardActivity {
  id: string;
  merchantName: string;
  merchantCategory?: string;
  amount: number;
  currency: string;
  status: 'confirmed' | 'pending';
  type: 'cashback' | 'discount';
  description: string;
  createdAt: number;
  eventName?: string;
}
