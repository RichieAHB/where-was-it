export type FetchBodiesResponse = {
  moon: {
    alt: number;
    az: number;
  };
  sun: {
    alt: number;
    az: number;
  };
};

export type FetchEarthResponse = {
  earth: {
    alt: number;
    az: number;
  };
  distance_miles: number;
};

const fetchBodies = (
  lat: number,
  lon: number,
  tzOffsetMinutes: number
): Promise<FetchBodiesResponse> =>
  fetch(
    `${process.env.BACKEND_HOST}/get_bodies?lat=${lat}&lon=${lon}&tz_offset_mins=${tzOffsetMinutes}`
  ).then((res) => res.json());

const fetchEarth = (
  lat: number,
  lon: number,
  date: string,
  tzOffsetMinutes: number
): Promise<FetchEarthResponse> =>
  fetch(
    `${process.env.BACKEND_HOST}/get_earth_then?lat=${lat}&lon=${lon}&when=${date}&tz_offset_mins=${tzOffsetMinutes}`
  ).then((res) => res.json());

export { fetchBodies, fetchEarth };
