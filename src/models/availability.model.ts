import type {
  DirectionsRaw,
  DirectionRaw,
  FlightRaw,
  SegmentRaw,
  OfferRaw,
  ProductRaw,
  FareServiceRaw,
  SegmentDataRaw,
} from './availability-raw.model';

export class DirectionsModel {
  readonly directions: DirectionModel[];
  constructor(raw: DirectionsRaw) {
    this.directions = raw.directions.map(d => new DirectionModel(d));
  }

  getRandomDirection(): DirectionModel | null {
    if (!this.directions.length) return null;
    const idx = Math.floor(Math.random() * this.directions.length);
    return this.directions[idx] || null;
  }
}

export class DirectionModel {
  readonly direction: string;
  readonly date: string;
  readonly minDirectionPrice: string;
  readonly latinOnly: string;
  readonly flights: FlightModel[];
  constructor(raw: DirectionRaw) {
    this.direction = raw.direction;
    this.date = raw.date;
    this.minDirectionPrice = raw.min_direction_price;
    this.latinOnly = raw.latin_only;
    this.flights = (raw.flights || []).map(f => new FlightModel(f));
  }

  getRandomFlight(): FlightModel | null {
    if (!this.flights.length) return null;
    const idx = Math.floor(Math.random() * this.flights.length);
    return this.flights[idx] || null;
  }
}

export class FlightModel {
  readonly latinOnly: string;
  readonly duration: number;
  readonly stops: number;
  readonly segments: SegmentModel[];
  readonly offers: OfferModel[];
  constructor(raw: FlightRaw) {
    this.latinOnly = raw.latin_only;
    this.duration = raw.duration;
    this.stops = raw.stops;
    this.segments = (raw.segments || []).map(s => new SegmentModel(s));
    this.offers = (raw.offers || []).map(o => new OfferModel(o));
  }

  getSegment(): SegmentModel | null {
    return this.segments[0] || null;
  }
}

export class SegmentModel {
  readonly ak: string;
  readonly oak: string;
  readonly akFullName: string;
  readonly flightNumber: string;
  readonly planeType: string;
  readonly planeTypeName: string;
  readonly departureDate: string;
  readonly departureTime: string;
  readonly departureUtc: string;
  readonly departureAirportCode: string;
  readonly arrivalDate: string;
  readonly arrivalTime: string;
  readonly arrivalUtc: string;
  readonly arrivalAirportCode: string;
  readonly departureCityCode: string;
  readonly arrivalCityCode: string;
  readonly departureCityFullName: string;
  readonly departureAirportFullName: string;
  readonly arrivalCityFullName: string;
  readonly arrivalAirportFullName: string;
  readonly duration: number;
  readonly class: string;
  readonly rbd: string;
  readonly layoverTime: string;
  readonly stops: any[];
  readonly bagtype: string;
  readonly bagallowance: string;
  readonly doctypeList: string;
  readonly standby: string;
  readonly airportCheckin: string;
  readonly airportCheckinUtc: string;
  constructor(raw: SegmentRaw) {
    this.ak = raw.ak;
    this.oak = raw.oak;
    this.akFullName = raw.ak_full_name;
    this.flightNumber = raw.flight_number;
    this.planeType = raw.plane_type;
    this.planeTypeName = raw.plane_type_name;
    this.departureDate = raw.departure_date;
    this.departureTime = raw.departure_time;
    this.departureUtc = raw.departure_utc;
    this.departureAirportCode = raw.departure_airport_code;
    this.arrivalDate = raw.arrival_date;
    this.arrivalTime = raw.arrival_time;
    this.arrivalUtc = raw.arrival_utc;
    this.arrivalAirportCode = raw.arrival_airport_code;
    this.departureCityCode = raw.departure_city_code;
    this.arrivalCityCode = raw.arrival_city_code;
    this.departureCityFullName = raw.departure_city_full_name;
    this.departureAirportFullName = raw.departure_airport_full_name;
    this.arrivalCityFullName = raw.arrival_city_full_name;
    this.arrivalAirportFullName = raw.arrival_airport_full_name;
    this.duration = raw.duration;
    this.class = raw.class;
    this.rbd = raw.rbd;
    this.layoverTime = raw.layover_time;
    this.stops = raw.stops;
    this.bagtype = raw.bagtype;
    this.bagallowance = raw.bagallowance;
    this.doctypeList = raw.doctype_list;
    this.standby = raw.standby;
    this.airportCheckin = raw.airport_checkin;
    this.airportCheckinUtc = raw.airport_checkin_utc;
  }
}

export class OfferModel {
  readonly marketingFareId: string;
  readonly marketingFareCode: string;
  readonly marketingFareCode2: string;
  readonly fareCode: string;
  readonly fareRulesKey: string;
  readonly price: string;
  readonly offerId: string;
  readonly seatCount: number;
  readonly products: ProductModel[];
  readonly fareServices: FareServiceModel[];
  readonly segmentData: SegmentDataModel[];
  constructor(raw: OfferRaw) {
    this.marketingFareId = raw.marketing_fare_id;
    this.marketingFareCode = raw.marketing_fare_code;
    this.marketingFareCode2 = raw.marketing_fare_code2;
    this.fareCode = raw.fare_code;
    this.fareRulesKey = raw.fare_rules_key;
    this.price = raw.price;
    this.offerId = raw.offer_id;
    this.seatCount = raw.seat_count;
    this.products = (raw.products || []).map(p => new ProductModel(p));
    this.fareServices = (raw.fare_services || []).map(f => new FareServiceModel(f));
    this.segmentData = (raw.segment_data || []).map(s => new SegmentDataModel(s));
  }
}

export class ProductModel {
  readonly passcat: string;
  readonly price: string;
  readonly fare: string;
  readonly taxes: string;
  readonly count: number;
  readonly sumPrice: string;
  readonly netprice: string | null;
  constructor(raw: ProductRaw) {
    this.passcat = raw.passcat;
    this.price = raw.price;
    this.fare = raw.fare;
    this.taxes = raw.taxes;
    this.count = raw.count;
    this.sumPrice = raw.sum_price;
    this.netprice = raw.netprice;
  }
}

export class FareServiceModel {
  readonly name: string;
  readonly code: string;
  readonly text: string;
  readonly value: string;
  readonly status: string;
  constructor(raw: FareServiceRaw) {
    this.name = raw.name;
    this.code = raw.code;
    this.text = raw.text;
    this.value = raw.value;
    this.status = raw.status;
  }
}

export class SegmentDataModel {
  readonly class: string;
  readonly marketingFareCode2: string;
  readonly rbd: string;
  constructor(raw: SegmentDataRaw) {
    this.class = raw.class;
    this.marketingFareCode2 = raw.marketing_fare_code2;
    this.rbd = raw.rbd;
  }
}
