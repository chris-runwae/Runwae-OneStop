// Helper to format date range e.g. "Feb 14-21 2026"
export const formatDateRange = (start: string, end: string) => {
  if (!start) return 'TBD';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };
  const startStr = startDate.toLocaleDateString('en-US', options);

  if (!endDate) return startStr;

  if (startDate.getMonth() === endDate.getMonth()) {
    return `${startStr}-${endDate.getDate()} ${endDate.getFullYear()}`;
  }

  const endStr = endDate.toLocaleDateString('en-US', {
    ...options,
    year: 'numeric',
  });
  return `${startStr} - ${endStr}`;
};

// Helper to calculate duration in days
export const calculateDuration = (start: string, end: string) => {
  if (!start || !end) return 'TBD';
  const diffTime = Math.abs(
    new Date(end).getTime() - new Date(start).getTime()
  );
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days`;
};

// export const formatDateRange = (start: string, end: string) => {
//   if (!start && !end) return 'No dates set';
//   const fmt = (d: string) =>
//     new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
//   if (start && end) return `${fmt(start)} → ${fmt(end)}`;
//   if (start) return `From ${fmt(start)}`;
//   return `Until ${fmt(end!)}`;
// };
