import { useCallback } from 'react';

// import { Toasts } from '@/utils';
import endpoints from '@/services/endpoints/viator';
import { useViatorStore } from '@/stores/useViatorStore';

const useViator = () => {
  // const [destinations, setDestinations] = useState<Destination[]>([]);
  const { setDestinations, setTags } = useViatorStore();
  // const viatorApiKey = process.env.EXPO_PUBLIC_VIATOR_API_KEY;

  const getOptions = useCallback(
    (method: 'GET' | 'POST' = 'GET', body?: any) => ({
      method,
      headers: {
        'Accept-Language': 'en-US',
        Accept: 'application/json;version=2.0',
        'exp-api-key': 'c6eb1e0b-45be-40d3-a855-513d36bd361e',
        ...(method === 'POST' && { 'Content-Type': 'application/json' }),
      },
      ...(body && { body: JSON.stringify(body) }),
    }),
    []
  );

  const getDestinations = useCallback(async () => {
    try {
      const response = await fetch(
        endpoints.getDestinations,
        getOptions('GET')
      );
      const data = await response.json();
      setDestinations(data?.destinations);
    } catch (error) {
      console.log('Error fetching destinations: ', error);
    }
  }, [getOptions, setDestinations]);

  const getTags = useCallback(async () => {
    try {
      const response = await fetch(endpoints.getTags, getOptions('GET'));
      const data = await response.json();
      setTags(data?.tags);
    } catch (error) {
      console.log('Error fetching tags: ', error);
    }
  }, [getOptions, setTags]);

  const getLifetimeExperiences = useCallback(
    async (body: any) => {
      try {
        const response = await fetch(
          endpoints.productsSearch,
          getOptions('POST', body)
        );

        const data = await response.json();
        // TODO: Add setLifetimeExperiences to store if you want to persist this data
        // setLifetimeExperiences(data?.lifetimeExperiences);
        return data;
      } catch (error) {
        console.log('Error fetching lifetime experiences: ', error);
        throw error;
      }
    },
    [getOptions]
  );

  return {
    getDestinations,
    getTags,
    getLifetimeExperiences,
  };
};

export default useViator;
