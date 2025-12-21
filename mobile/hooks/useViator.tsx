import { useCallback, useMemo } from 'react';

// import { Toasts } from '@/utils';
import endpoints from '@/services/endpoints/viator';
import { useViatorStore } from '@/stores/useViatorStore';

const useViator = () => {
  // const [destinations, setDestinations] = useState<Destination[]>([]);
  const { setDestinations, setTags } = useViatorStore();
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
      console.log('Error fetching destinations: ', error);
    }
  }, [options, setDestinations]);

  const getTags = useCallback(async () => {
    try {
      const response = await fetch(endpoints.getTags, options);
      const data = await response.json();
      setTags(data?.tags);
    } catch (error) {
      console.log('Error fetching tags: ', error);
    }
  }, [options, setTags]);

  return {
    getDestinations,
    getTags,
  };
};

export default useViator;
