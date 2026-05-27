const GRAPHQL = 'https://macrulez-api.ru/api/airlines/graphql';

async function gql<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const res = await fetch(GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// Reservoir sampling — равномерная выборка без повторений
function sampleN<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return [...arr];
  const result = arr.slice(0, n);
  for (let i = n; i < arr.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    if (j < n) result[j] = arr[i]!;
  }
  return result;
}

// Расстояние по формуле Haversine, км
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface AirportData {
  iata: string;
  lat: number;
  lon: number;
  name: string;
}

export interface SegmentData {
  depIata: string;
  arrIata: string;
  airlineIata: string;
  airlineName: string;
}

export interface RandomRouteResult {
  segments: SegmentData[];
  airports: Record<string, AirportData>;
}

// ── Вспомогательная: загрузить координаты аэропортов ──────────────────────────
async function loadAirportCoords(iatas: string[]): Promise<Record<string, AirportData>> {
  if (!iatas.length) return {};
  const data = await gql<{
    airportBatch: Array<{
      iataCode: string;
      latitudeDeg: number;
      longitudeDeg: number;
      name: string;
      municipality: string;
    }>;
  }>(
    `query($iatas: [String!]!) {
      airportBatch(iatas: $iatas) { iataCode latitudeDeg longitudeDeg name municipality }
    }`,
    { iatas },
  );
  const result: Record<string, AirportData> = {};
  for (const a of data.airportBatch ?? []) {
    if (a.latitudeDeg == null || a.longitudeDeg == null) continue;
    result[a.iataCode] = {
      iata: a.iataCode,
      lat: a.latitudeDeg,
      lon: a.longitudeDeg,
      name: a.municipality || a.name || a.iataCode,
    };
  }
  return result;
}

// ── Константы отбора ──────────────────────────────────────────────────────────
const ROUTE_SAMPLE_SIZE   = 30;   // кандидатов для оценки расстояния
const MIN_DIST_KM         = 2000; // предпочтительный минимум (выше — ищем пересадки)
const FALLBACK_DIST_KM    = 1000; // если нет длинных — берём средние
const CONNECTION_DIST_KM  = MIN_DIST_KM; // >= этого значения ищем маршрут с пересадками

// ── Основная функция ──────────────────────────────────────────────────────────
export async function fetchRandomRoute(): Promise<RandomRouteResult> {
  // 1. Список авиакомпаний
  const d1 = await gql<{
    routeStatsByAirline: Array<{ airlineIata: string; airlineName: string; routesCount: number }>;
  }>(`{ routeStatsByAirline { airlineIata airlineName routesCount } }`);

  const candidates = d1.routeStatsByAirline.filter(a => a.routesCount >= 15);
  if (!candidates.length) throw new Error('No airlines with enough routes');
  const airline = pickRandom(candidates);

  // 2. Маршруты авиакомпании
  const d2 = await gql<{
    airlineDestinations: { routes: Array<{ depIata: string; arrIata: string }> };
  }>(
    `query($code: String!) {
      airlineDestinations(code: $code) { routes { depIata arrIata } }
    }`,
    { code: airline.airlineIata },
  );
  const allRoutes = d2.airlineDestinations?.routes ?? [];
  if (!allRoutes.length) throw new Error('No routes for airline');

  // 3. Сэмплируем N маршрутов и получаем их координаты одним батчем
  const sample = sampleN(allRoutes, ROUTE_SAMPLE_SIZE);
  const sampleIatas = [...new Set(sample.flatMap(r => [r.depIata, r.arrIata]))];
  const baseAirports = await loadAirportCoords(sampleIatas);

  // 4. Фильтруем по расстоянию — предпочитаем дальние маршруты
  type RouteWithDist = { depIata: string; arrIata: string; dist: number };
  const withDist: RouteWithDist[] = sample
    .filter(r => baseAirports[r.depIata] && baseAirports[r.arrIata])
    .map(r => ({
      depIata: r.depIata,
      arrIata: r.arrIata,
      dist: haversineKm(
        baseAirports[r.depIata]!.lat, baseAirports[r.depIata]!.lon,
        baseAirports[r.arrIata]!.lat, baseAirports[r.arrIata]!.lon,
      ),
    }));

  const longHaul = withDist.filter(r => r.dist >= MIN_DIST_KM);
  const mediumHaul = withDist.filter(r => r.dist >= FALLBACK_DIST_KM);
  const pool = longHaul.length > 0 ? longHaul : mediumHaul.length > 0 ? mediumHaul : withDist;
  if (!pool.length) throw new Error('No routes with coordinates');

  const baseRoute = pickRandom(pool);
  const depAirport = baseAirports[baseRoute.depIata]!;
  const arrAirport = baseAirports[baseRoute.arrIata]!;

  // Прямой маршрут (короткие расстояния или fallback)
  const directFallback = (): RandomRouteResult => ({
    segments: [{
      depIata: baseRoute.depIata,
      arrIata: baseRoute.arrIata,
      airlineIata: airline.airlineIata,
      airlineName: airline.airlineName,
    }],
    airports: baseAirports,
  });

  // Если маршрут короткий — возвращаем прямой рейс, пересадки не нужны
  if (baseRoute.dist < CONNECTION_DIST_KM) return directFallback();

  // 5. ISO-коды стран для dep и arr через citySearch (параллельно)
  type CityInfo = { cityName: string; isoCountry: string; airports: Array<{ iataCode: string }> };
  let depCities: CityInfo[] = [];
  let arrCities: CityInfo[] = [];
  try {
    [depCities, arrCities] = await Promise.all([
      gql<{ citySearch: CityInfo[] }>(
        `query($name: String!) {
          citySearch(name: $name, limit: 20) { cityName isoCountry airports { iataCode } }
        }`,
        { name: depAirport.name },
      ).then(d => d.citySearch ?? []),
      gql<{ citySearch: CityInfo[] }>(
        `query($name: String!) {
          citySearch(name: $name, limit: 20) { cityName isoCountry airports { iataCode } }
        }`,
        { name: arrAirport.name },
      ).then(d => d.citySearch ?? []),
    ]);
  } catch {
    return directFallback();
  }

  const findCityByIata = (cities: CityInfo[], iata: string) =>
    cities.find(c => c.airports.some(a => a.iataCode === iata));

  const depCity = findCityByIata(depCities, baseRoute.depIata);
  const arrCity = findCityByIata(arrCities, baseRoute.arrIata);
  if (!depCity || !arrCity) return directFallback();

  // 6. Поиск маршрутов с пересадками (1–2 stops)
  type RouteSeg = {
    depIata: string;
    arrIata: string;
    airlines: Array<{ iata: string; name: string }>;
  };
  type RouteGroup = { stops: number; routes: Array<{ segments: RouteSeg[] }> };

  let routeGroups: RouteGroup[] = [];
  try {
    const d6 = await gql<{ cityRoutes: RouteGroup[] }>(
      `query CityRoutes(
        $depCity: String!, $depCountry: String!,
        $arrCity: String!, $arrCountry: String!, $maxStops: Int
      ) {
        cityRoutes(
          depCity: $depCity, depCountry: $depCountry,
          arrCity: $arrCity, arrCountry: $arrCountry, maxStops: $maxStops
        ) {
          stops
          routes {
            segments { depIata arrIata airlines { iata name } }
          }
        }
      }`,
      {
        depCity: depCity.cityName,
        depCountry: depCity.isoCountry,
        arrCity: arrCity.cityName,
        arrCountry: arrCity.isoCountry,
        maxStops: 2,
      },
    );
    routeGroups = d6.cityRoutes ?? [];
  } catch {
    return directFallback();
  }

  // Только маршруты с 1–2 пересадками, у каждого сегмента есть авиакомпания
  const withStops = routeGroups
    .filter(g => g.stops >= 1 && g.stops <= 2)
    .flatMap(g => g.routes)
    .filter(r => r.segments.every(s => s.airlines.length > 0));

  if (!withStops.length) return directFallback();

  // Предпочитаем интерлайн (разные авиакомпании на сегментах)
  const interline = withStops.filter(r => {
    const aiatas = r.segments.map(s => s.airlines[0]!.iata);
    return new Set(aiatas).size > 1;
  });
  const chosen = pickRandom(interline.length ? interline : withStops);

  // Случайная авиакомпания для каждого сегмента
  const segments: SegmentData[] = chosen.segments.map(s => {
    const al = pickRandom(s.airlines);
    return { depIata: s.depIata, arrIata: s.arrIata, airlineIata: al.iata, airlineName: al.name };
  });

  // 7. Координаты промежуточных аэропортов (которых ещё нет в baseAirports)
  const allIatas = [...new Set(segments.flatMap(s => [s.depIata, s.arrIata]))];
  const missing = allIatas.filter(iata => !baseAirports[iata]);
  let extra: Record<string, AirportData> = {};
  if (missing.length) {
    try {
      extra = await loadAirportCoords(missing);
    } catch {
      return directFallback();
    }
  }

  const airports: Record<string, AirportData> = { ...baseAirports, ...extra };
  if (allIatas.some(iata => !airports[iata])) return directFallback();

  return { segments, airports };
}
