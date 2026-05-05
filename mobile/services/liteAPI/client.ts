const options = {
  method: 'POST',
  headers: {
    accept: 'application/json',
    'content-type': 'application/json',
    'X-API-Key': process.env.EXPO_PUBLIC_LITE_API_KEY ?? process.env.LITE_API_KEY ?? '',
  },
};



export default function getHotelRates(hotelId: string) {
  return fetch(
    `https://api.liteapi.travel/v3.0/hotels/rates?hotelId=${hotelId}`,
    options
  )
    .then((res) => res.json())
    .then((res) => console.log(res))
    .catch((err) => console.error(err));
}
