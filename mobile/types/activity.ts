// =====================================================
// ACTIVITY & COLLABORATION TYPES
// =====================================================

// SHARED TYPES
// =====================================================
export type ExpenseCategory = 'food' | 'lodging' | 'transport' | 'misc';

export interface TripMember {
  id: string;
  user_id: string;
  trip_id: string;
  role: 'owner' | 'admin' | 'member';
  user: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// EXPENSES
// =====================================================
export interface Expense {
  id: string;
  trip_id: string;
  created_by: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  participants?: ExpenseParticipant[];
}

export interface ExpenseParticipant {
  id: string;
  expense_id: string;
  user_id: string;
  share_amount: number;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ExpenseBalance {
  userId: string;
  totalPaid: number;
  totalOwed: number;
  balance: number; // positive = owed to you, negative = you owe
}

export interface ExpenseSummary {
  totalSpent: number;
  youOwe: number;
  youAreOwed: number;
  balances: Map<string, ExpenseBalance>;
}

export interface CreateExpenseInput {
  trip_id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expense_date?: string;
  participant_ids: string[]; // User IDs to split with
}

// POLLS
// =====================================================
export interface Poll {
  id: string;
  trip_id: string;
  created_by: string;
  question: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  creator?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  options?: PollOption[];
  votes?: PollVote[];
  user_vote?: PollVote; // Current user's vote if exists
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  position: number;
  created_at: string;
  vote_count?: number; // Computed from votes
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CreatePollInput {
  trip_id: string;
  question: string;
  options: string[]; // Array of option texts
  expires_at?: string;
}

export interface PollResults {
  poll_id: string;
  total_votes: number;
  options: {
    option_id: string;
    option_text: string;
    vote_count: number;
    percentage: number;
    voters: {
      id: string;
      full_name?: string;
      avatar_url?: string;
    }[];
  }[];
  user_voted: boolean;
  user_vote_option_id?: string;
}

// CHECKLISTS
// =====================================================
export interface Checklist {
  id: string;
  trip_id: string;
  created_by: string;
  title: string;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  is_completed: boolean;
  completed_by: string | null;
  completed_at: string | null;
  position: number;
  created_at: string;
  completer?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
}

export interface CreateChecklistInput {
  trip_id: string;
  title: string;
}

export interface CreateChecklistItemInput {
  checklist_id: string;
  text: string;
  position: number;
}

export interface UpdateChecklistItemInput {
  id: string;
  is_completed: boolean;
}

// ANNOUNCEMENTS
// =====================================================
export interface Announcement {
  id: string;
  trip_id: string;
  created_by: string;
  title: string;
  message: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  creator?: {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
  is_read?: boolean; // Whether current user has read it
  read_at?: string | null;
}

export interface AnnouncementRead {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
}

export interface CreateAnnouncementInput {
  trip_id: string;
  title: string;
  message: string;
  is_pinned?: boolean;
}

export interface AnnouncementBadge {
  unread_count: number;
  has_pinned: boolean;
}

// ACTIVITY TAB
// =====================================================
export type ActivitySection = 'expenses' | 'polls' | 'checklists' | 'announcements';

export interface ActivityBadges {
  expenses: number;
  polls: number;
  checklists: number;
  announcements: number;
}