import { toDateId } from '@marceloterreiro/flash-calendar';

export const generateMonths = (currentMonthId: string): { id: string; name: string }[] => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentDate = new Date(currentMonthId);
  const currentYear = currentDate.getFullYear();
  
  return monthNames.map((monthName, index) => {
    const monthDate = new Date(currentYear, index, 1);
    const monthId = toDateId(monthDate);
    return { id: monthId, name: monthName };
  });
};

export const generateYears = (currentMonthId: string): { id: string; name: string }[] => {
  const years: { id: string; name: string }[] = [];
  const currentDate = new Date(currentMonthId);
  const currentYear = currentDate.getFullYear();
  
  for (let i = currentYear - 10; i <= currentYear + 10; i++) {
    years.push({ id: i.toString(), name: i.toString() });
  }
  
  return years;
};

export const getCurrentMonth = (currentMonthId: string): string => {
  const date = new Date(currentMonthId);
  return date.toLocaleDateString('en-US', { month: 'long' });
};

export const getCurrentYear = (currentMonthId: string): string => {
  const date = new Date(currentMonthId);
  return date.getFullYear().toString();
};

export const createYearMonthId = (year: number, monthIndex: number): string => {
  const yearDate = new Date(year, monthIndex, 1);
  return toDateId(yearDate);
};
