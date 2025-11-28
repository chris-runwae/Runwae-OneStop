export const formatDate = (date: Date | null) => {
  if (!date) return 'Select date';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (time: Date | null) => {
  if (!time) return 'Select time';
  return time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

// export const formatDateRange = (startDate: Date | null, endDate: Date | null) => {
//   if (!tripData.startDate || !tripData.endDate) return '';
//   const start = new Date(tripData.startDate).toLocaleDateString('en-US', {
//     day: 'numeric',
//     month: 'short',
//   });
//   const end = new Date(tripData.endDate).toLocaleDateString('en-US', {
//     day: 'numeric',
//     month: 'short',
//   });
//   return `${start} - ${end}`;
// };
