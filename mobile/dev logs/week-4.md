# Week 4: Activity & Collaboration System

## 🎯 Overview

A complete collaborative planning system for Runwae that transforms trips into shared workspaces. Built as an **embedded tab system** within `TripDetailScreen` (NOT separate routes).

**Authentication:** Designed for **Clerk** - uses TEXT for `user_id` instead of UUID.

**Table:** Uses `trip_attendees` (not `trip_members`) for attendee management.

## 🏗️ Architecture

```
TripDetailScreen (Route-level screen)
    │
    └── ActivityTab (Container Component)
            │
            ├── ExpensesList (Feature Module)
            ├── PollsList (Feature Module)
            ├── ChecklistsList (Feature Module)
            └── AnnouncementsList (Feature Module)
```

**Key Principle:** ActivityTab is a **component**, not a screen. It lives inside `TripDetailScreen` with no navigation logic.

## 📦 What's Included

### 1. Database Schema
- **Complete Supabase SQL** with tables, indexes, RLS policies
- Four feature domains: Expenses, Polls, Checklists, Announcements
- Real-time subscriptions enabled
- Security-first with trip membership checks

### 2. TypeScript Types
- Comprehensive type definitions
- Frontend-backend type alignment
- Computed properties (vote counts, completion %)
- Strict typing throughout

### 3. Data Layer
- Supabase queries for all CRUD operations
- React hooks with real-time subscriptions
- Optimized with proper cleanup
- Error handling built-in

### 4. UI Components
- **ActivityTab:** Animated segment control
- **ExpensesList:** Summary cards + split tracking
- **PollsList:** Animated vote bars
- **ChecklistsList:** Progress tracking
- **AnnouncementsList:** Pinned messages + read status
- **5 Modal Forms:** Create flows for each feature

### 5. Animations & Polish
- React Native Reanimated for 60fps
- Haptic feedback on interactions
- Smooth transitions with LayoutAnimation
- Gradient buttons and cards
- Empty states with helpful guidance

## 🎨 Feature Breakdown

### 💰 Expenses Module

**What Users Can Do:**
- Add expenses with description, amount, category
- Split equally among selected trip members
- View summary: Total Spent, You Owe, You're Owed
- See who paid and who owes

**Technical Details:**
- Equal split calculation in backend
- Real-time balance updates
- Category-based organization
- Participant selection with avatars

**Files:**
- `ExpensesList.tsx` - Main list with summary cards
- `AddExpenseModal.tsx` - Form with participant picker

### 📊 Polls Module

**What Users Can Do:**
- Create polls with 2-6 options
- Vote once on any poll
- See live results with percentages
- View who voted for what

**Technical Details:**
- Upsert logic prevents duplicate votes
- Animated vote bars (spring animations)
- Real-time vote counting
- Visual indication of user's vote

**Files:**
- `PollsList.tsx` - Poll cards with animated results
- `CreatePollModal.tsx` - Dynamic option management

### ✓ Checklists Module

**What Users Can Do:**
- Create collaborative checklists
- Add/toggle items
- See who completed each item
- Track progress with visual bars

**Technical Details:**
- Position-based ordering
- Completion tracking with user attribution
- Progress percentage calculation
- Expand/collapse with animations

**Files:**
- `ChecklistsList.tsx` - Expandable checklist cards
- `AddChecklistModal.tsx` - Checklist creation with items

### 📢 Announcements Module

**What Users Can Do:**
- Admins: Post and pin announcements
- Members: View announcements and read status
- Auto-mark as read after viewing
- See unread badges

**Technical Details:**
- Admin-only posting (RLS enforced)
- Pin functionality for important messages
- Read tracking per user
- Real-time delivery

**Files:**
- `AnnouncementsList.tsx` - Feed with pinned items
- `CreateAnnouncementModal.tsx` - Admin posting form

## 🎯 Key Technical Decisions

### Why Embedded (Not Routed)?
Activity features are **contextual to a trip**. Users shouldn't navigate away from the trip to interact with these features. This keeps the mental model simple: "I'm in my trip, and I can access activity features right here."

### Real-time Architecture
Every module subscribes to its Supabase tables:
```typescript
supabase
  .channel(`expenses:${tripId}`)
  .on('postgres_changes', { ... }, () => reload())
  .subscribe()
```

This ensures **all trip members see updates instantly** without manual refresh.

### Security Model
All features respect trip attendance via RLS:
```sql
-- Example: Only trip attendees can view expenses
CREATE POLICY "Trip attendees can view expenses"
  ON expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trip_attendees
      WHERE trip_attendees.trip_id = expenses.trip_id
      AND trip_attendees.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
```

**Note:** RLS policies use Clerk JWT claims to identify users (`current_setting('request.jwt.claims', true)::json->>'sub'`).

### Animation Strategy
- **Layout changes:** LayoutAnimation (expand/collapse)
- **Value animations:** Reanimated (vote bars, progress)
- **Micro-interactions:** Haptics + withSequence (pulse effects)
- **Gradient backgrounds:** expo-linear-gradient

## 📊 Data Flow Example

**User votes in a poll:**

1. User taps option → `handleVote()`
2. Haptic feedback fires
3. `votePoll()` upserts to Supabase
4. Supabase broadcasts change
5. All subscribed clients receive update
6. `calculatePollResults()` recalculates
7. Vote bars animate to new percentages
8. UI shows user's selection

**Total time:** ~200-500ms with smooth animations

## 🎨 Design System

### Colors
- **Primary:** `#3B82F6` → `#2563EB` (gradients)
- **Success:** `#10B981` (completed items, positive balances)
- **Warning:** `#EF4444` (owed amounts)
- **Neutral:** `#6B7280` (meta text)
- **Background:** `#F8F9FA` (page background)

### Typography
- **Headers:** 18px, 600 weight
- **Body:** 15px, 400 weight
- **Meta:** 13px, 400 weight
- **Font:** System default (San Francisco on iOS)

### Spacing
- **Padding:** 16px standard
- **Gap:** 12px between cards
- **Border Radius:** 12-16px for cards

## 🚀 Performance Optimizations

### Query Optimizations
- Indexed foreign keys (trip_id, user_id)
- Select only needed fields with relations
- Subscription filters by trip_id

### React Optimizations
- `useMemo` for expensive calculations (summaries, results)
- Proper key extraction in FlatList
- Cleanup subscriptions in useEffect
- Debounced real-time updates (1500ms for auto-read)

### Animation Optimizations
- Hardware-accelerated transforms
- `useNativeDriver: true` where possible
- LayoutAnimation for layout-only changes
- Spring physics for natural movement

## 📱 Mobile-First Considerations

### Touch Targets
- Minimum 44x44pt for all interactive elements
- Extra padding on small buttons
- Swipe gestures avoided (segment control uses taps)

### Keyboard Handling
- KeyboardAvoidingView in all modals
- Auto-dismiss on submit
- Proper tab order for form fields

### Offline Behavior
- Supabase handles offline queueing
- Optimistic UI updates with haptics
- Error states with retry options

## 🧪 Testing Guide

### Manual Testing Checklist

**Expenses:**
- [ ] Create expense with multiple participants
- [ ] Verify split calculation (amount / participant count)
- [ ] Check summary updates (Total, Owe, Owed)
- [ ] Test as both payer and participant

**Polls:**
- [ ] Create poll with 2-6 options
- [ ] Vote and verify results show
- [ ] Check vote bars animate correctly
- [ ] Verify one vote per user (try voting again)

**Checklists:**
- [ ] Create checklist with items
- [ ] Toggle completion as different users
- [ ] Verify completer name shows
- [ ] Check progress bar updates

**Announcements:**
- [ ] Post as admin (should work)
- [ ] Try as member (should see error or no button)
- [ ] Pin an announcement
- [ ] Verify read status updates

### Real-time Testing
- [ ] Open same trip on two devices
- [ ] Create expense on device A
- [ ] Verify device B sees it instantly
- [ ] Repeat for polls, checklists, announcements

### Edge Cases
- [ ] Empty states render correctly
- [ ] Long text wraps properly
- [ ] Forms validate inputs
- [ ] Network errors show friendly messages
- [ ] Rapid interactions don't cause issues

## 🐛 Troubleshooting

### "Can't read property 'id' of undefined"
**Fix:** Ensure user is loaded before passing to ActivityTab
```typescript
if (!currentUserId) return <LoadingScreen />;
return <ActivityTab userId={currentUserId} ... />;
```

### Real-time not working
**Check:**
1. Realtime enabled in Supabase dashboard
2. Subscription channel names match
3. Filter conditions (trip_id) are correct

### RLS Policy errors
**Verify:**
1. User is in `trip_members` table
2. Policy conditions match your queries
3. `auth.uid()` returns the correct user

### TypeScript errors
**Common fixes:**
- Check import paths (`@/lib/supabase`)
- Ensure types.ts is in correct location
- Verify Supabase client is properly typed

## 📈 Future Enhancements

### Phase 2 (Post-MVP)
- **Expense Settlement:** Suggest optimal payment flows
- **Poll Editing:** Allow creators to modify polls
- **Checklist Reordering:** Drag-to-reorder items
- **Announcement Comments:** Reply threads
- **Push Notifications:** Real-time alerts

### Phase 3 (Advanced)
- **File Attachments:** Photos in announcements
- **Rich Text:** Markdown support
- **Multi-currency:** Automatic conversion
- **Custom Splits:** Unequal expense division
- **Activity Feed:** Combined timeline view

## 💡 Usage Examples

### Adding ActivityTab to Existing Screen

```typescript
// screens/trips/TripDetailScreen.tsx
import { useAuth } from '@clerk/clerk-expo';
import ActivityTab from '../activity/ActivityTab';

export default function TripDetailScreen({ tripId }) {
  const { userId } = useAuth(); // Clerk user ID
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin/owner
    async function checkRole() {
      if (!userId) return;
      
      const { data } = await supabase
        .from('trip_attendees')
        .select('role')
        .eq('trip_id', tripId)
        .eq('user_id', userId)
        .single();
        
      setIsAdmin(data?.role === 'admin' || data?.role === 'owner');
    }
    checkRole();
  }, [userId, tripId]);

  if (!userId) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Your existing trip content */}
      
      <ActivityTab 
        tripId={tripId}
        userId={userId}
        isAdmin={isAdmin}
      />
    </View>
  );
}
```

### Customizing Segment Order

```typescript
// ActivityTab.tsx
const SEGMENTS = [
  { key: 'announcements', label: 'News', icon: '📢' },  // Moved to front
  { key: 'expenses', label: 'Expenses', icon: '💰' },
  { key: 'polls', label: 'Polls', icon: '📊' },
  { key: 'checklists', label: 'Tasks', icon: '✓' },
];
```

### Adding Custom Styling

```typescript
// Override default colors
const styles = StyleSheet.create({
  segmentControl: {
    backgroundColor: '#YOUR_COLOR',  // Custom background
  },
  activeIndicator: {
    backgroundColor: '#YOUR_PRIMARY',  // Custom accent
  },
});
```

## 📚 Dependencies

```json
{
  "dependencies": {
    "react-native-reanimated": "^3.x",
    "expo-linear-gradient": "^13.x",
    "expo-haptics": "^13.x",
    "@supabase/supabase-js": "^2.x"
  }
}
```

## 🏆 Production Checklist

- [x] TypeScript strict mode
- [x] Error boundaries
- [x] Loading states
- [x] Empty states
- [x] Haptic feedback
- [x] Smooth animations (60fps)
- [x] Real-time sync
- [x] RLS security
- [x] Proper cleanup (useEffect)
- [x] Accessible colors (WCAG AA)
- [x] Mobile-optimized touch targets
- [x] Keyboard handling
- [x] Network error handling

## 📞 Support

For issues or questions:
1. Check INTEGRATION_GUIDE.md for setup steps
2. Review supabase-schema.sql for database structure
3. Verify all files are in correct locations
4. Test with sample data first

---

**Built with ❤️ for Runwae**

This system is production-ready and designed to scale. All code follows React Native + Expo best practices with a focus on performance, security, and user experience.