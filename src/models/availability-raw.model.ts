// Корневой тип ответа (например, AvailabilityResponse)
export interface DirectionsRaw {
  directions: DirectionRaw[];
}

export interface DirectionRaw {
  direction: string;
  date: string;
  min_direction_price: string;
  latin_only: string;
  flights: FlightRaw[];
}

export interface FlightRaw {
  latin_only: string;
  duration: number;
  stops: number;
  segments: SegmentRaw[];
  offers: OfferRaw[];
}

export interface SegmentRaw {
  ak: string;
  oak: string;
  ak_full_name: string;
  flight_number: string;
  plane_type: string;
  plane_type_name: string;
  departure_date: string;
  departure_time: string;
  departure_utc: string;
  departure_airport_code: string;
  arrival_date: string;
  arrival_time: string;
  arrival_utc: string;
  arrival_airport_code: string;
  departure_city_code: string;
  arrival_city_code: string;
  departure_city_full_name: string;
  departure_airport_full_name: string;
  arrival_city_full_name: string;
  arrival_airport_full_name: string;
  duration: number;
  class: string;
  rbd: string;
  layover_time: string;
  stops: any[];
  bagtype: string;
  bagallowance: string;
  doctype_list: string;
  standby: string;
  airport_checkin: string;
  airport_checkin_utc: string;
}

export interface OfferRaw {
  marketing_fare_id: string;
  marketing_fare_code: string;
  marketing_fare_code2: string;
  fare_code: string;
  fare_rules_key: string;
  price: string;
  offer_id: string;
  seat_count: number;
  products: ProductRaw[];
  fare_services: FareServiceRaw[];
  segment_data: SegmentDataRaw[];
}

export interface ProductRaw {
  passcat: string;
  price: string;
  fare: string;
  taxes: string;
  count: number;
  sum_price: string;
  netprice: string | null;
}

export interface FareServiceRaw {
  name: string;
  code: string;
  text: string;
  value: string;
  status: string;
}

export interface SegmentDataRaw {
  class: string;
  marketing_fare_code2: string;
  rbd: string;
}
