const baseUrl = process.env.EXPO_PUBLIC_VIATOR_API_URL;

const endpoints = {
  searchViator: (text: string, filters: any) => {
    return `${baseUrl}/products/search?text=${text}&filters=${filters}`;
  },
};

export default endpoints;
