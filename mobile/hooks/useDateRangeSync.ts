import { useEffect, useRef } from 'react';

interface UseDateRangeSyncProps {
  dateRange: { startId?: string; endId?: string } | undefined;
  onUpdateData: (key: string, value: any) => void;
}

export const useDateRangeSync = ({
  dateRange,
  onUpdateData,
}: UseDateRangeSyncProps) => {
  const lastDateRangeRef = useRef<
    { startId?: string; endId?: string } | undefined
  >(undefined);

  useEffect(() => {
    // Only update if the date range has actually changed
    const currentStartId = dateRange?.startId;
    const currentEndId = dateRange?.endId;
    const lastStartId = lastDateRangeRef.current?.startId;
    const lastEndId = lastDateRangeRef.current?.endId;

    if (currentStartId !== lastStartId) {
      onUpdateData('startDate', currentStartId || null);
    }

    if (currentEndId !== lastEndId) {
      onUpdateData('endDate', currentEndId || null);
    }

    // Update the ref to current values
    lastDateRangeRef.current = dateRange;
  }, [dateRange, onUpdateData]);
};
