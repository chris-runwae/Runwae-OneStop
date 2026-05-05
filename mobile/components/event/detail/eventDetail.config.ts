export const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  easy:     { label: 'Easy',     color: '#16a34a', bg: '#dcfce7' },
  moderate: { label: 'Moderate', color: '#d97706', bg: '#fef3c7' },
  hard:     { label: 'Hard',     color: '#dc2626', bg: '#fee2e2' },
  expert:   { label: 'Expert',   color: '#7c3aed', bg: '#ede9fe' },
};

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:    { label: '● Open',      color: '#16a34a' },
  sold_out:  { label: '● Sold Out',  color: '#dc2626' },
  cancelled: { label: '● Cancelled', color: '#6b7280' },
  upcoming:  { label: '● Upcoming',  color: '#2563eb' },
};
