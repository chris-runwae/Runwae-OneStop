// Save as: @/components/TripDiscoverySection/utils.ts

/**
 * Validates dates and adjusts them if they're in the past
 * If startDate or endDate is in the past, sets startDate to today
 * and endDate to 11 months from today
 */
export const validateAndAdjustDates = (
  startDate?: string,
  endDate?: string
): { adjustedStartDate?: string; adjustedEndDate?: string } => {
  if (!startDate || !endDate) {
    return { adjustedStartDate: startDate, adjustedEndDate: endDate };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Check if either date is in the past
  if (start < today || end < today) {
    const newStartDate = new Date();
    newStartDate.setHours(0, 0, 0, 0);

    const newEndDate = new Date(newStartDate);
    newEndDate.setMonth(newEndDate.getMonth() + 11);

    return {
      adjustedStartDate: newStartDate.toISOString().split('T')[0],
      adjustedEndDate: newEndDate.toISOString().split('T')[0],
    };
  }

  return { adjustedStartDate: startDate, adjustedEndDate: endDate };
};
