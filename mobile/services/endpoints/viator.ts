// const baseUrl = process.env.EXPO_PUBLIC_VIATOR_API_URL;
//for some reason that does not work
const baseUrl = 'https://api.sandbox.viator.com/partner';

const endpoints = {
  searchViator: (text: string, filters: any) => {
    return `${baseUrl}/products/search?text=${text}&filters=${filters}`;
  },
  getDestinations: `${baseUrl}/destinations?campaign-value=string`,
};

export default endpoints;
