const baseUrl = process.env.EXPO_PUBLIC_LITE_API_URL;

const endpoints = {
  getHotelList: (countryCode: string, city: string) => {
    return `${baseUrl}/data/hotels?countryCode=${countryCode}&cityName=${city}`;
  },
  getHotelById: (id: string) => {
    return `${baseUrl}/data/hotel?hotelId=${id}&timeout=1.5}`;
  },
  getHotelsByPlaceId: (placeId: string) => {
    return `${baseUrl}/data/hotels?placeId=${placeId}`;
  },
};

export default endpoints;
