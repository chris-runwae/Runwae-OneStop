import { useCallback, useMemo } from 'react';

import { Toasts } from '@/utils';
import endpoints from '@/services/endpoints/viator';
import { useViatorStore } from '@/stores/useViatorStore';

const useViator = () => {
  // const [destinations, setDestinations] = useState<Destination[]>([]);
  const { setDestinations } = useViatorStore();
  // const viatorApiKey = process.env.EXPO_PUBLIC_VIATOR_API_KEY;

  const options = useMemo(
    () => ({
      method: 'GET' as const,
      headers: {
        'Accept-Language': 'en-US',
        Accept: 'application/json;version=2.0',
        'exp-api-key': 'c6eb1e0b-45be-40d3-a855-513d36bd361e',
      },
    }),
    []
  );

  const getDestinations = useCallback(async () => {
    try {
      const response = await fetch(endpoints.getDestinations, options);
      const data = await response.json();
      setDestinations(data?.destinations);
    } catch (error) {
      Toasts.showErrorToast(
        'We could not get the destinations. Please try again later.'
      );
      console.log('Error fetching destinations: ', error);
    }
  }, [options, setDestinations]);

  return {
    getDestinations,
  };
};

export default useViator;
