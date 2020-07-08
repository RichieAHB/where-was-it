type FetchBodiesResponse = {
  moon: {
    alt: number;
    az: number;
  };
  sun: {
    alt: number;
    az: number;
  };
};

type FetchEarthResponse = {
  earth: {
    alt: number;
    az: number;
  },
  distance_miles: number;
};

const fetchBodies = (lat: number, lon: number): Promise<FetchBodiesResponse> =>
  fetch(
    `${process.env.BACKEND_HOST}/get_bodies?lat=${lat}&lon=${lon}`
  ).then((res) => res.json());

const fetchEarth = (lat: number, lon: number, date: string): Promise<FetchEarthResponse> => fetch(
  `${process.env.BACKEND_HOST}/get_earth_then?lat=${lat}&lon=${lon}&when=${date}`
).then((res) => res.json());

export { fetchBodies, fetchEarth };
