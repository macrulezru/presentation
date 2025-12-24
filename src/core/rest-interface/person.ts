export interface PersonInterface<T = unknown> {
  results: T[]
  info: ResponseInfo
}

export interface Person {
  gender: Gender
  name: UserName
  location: Location
  email: string
  login: Login
  dob: DateInfo
  registered: DateInfo
  phone: string
  cell: string
  id: UserId
  picture: Picture
  nat: Nationality
}

export interface UserName {
  title: string
  first: string
  last: string
}

export interface Location {
  street: Street
  city: string
  state: string
  country: Country
  postcode: string | number
  coordinates: Coordinates
  timezone: Timezone
}

export interface Street {
  number: number
  name: string
}

export interface Coordinates {
  latitude: string
  longitude: string
}

export interface Timezone {
  offset: string
  description: string
}

export interface Login {
  uuid: string
  username: string
  password: string
  salt: string
  md5: string
  sha1: string
  sha256: string
}

export interface DateInfo {
  date: string
  age: number
}

export interface UserId {
  name: string
  value: string
}

export interface Picture {
  large: string
  medium: string
  thumbnail: string
}

export type Gender = 'male' | 'female'

export type Nationality =
  | 'AU'
  | 'BR'
  | 'CA'
  | 'CH'
  | 'DE'
  | 'DK'
  | 'ES'
  | 'FI'
  | 'FR'
  | 'GB'
  | 'IE'
  | 'IN'
  | 'IR'
  | 'MX'
  | 'NL'
  | 'NO'
  | 'NZ'
  | 'RS'
  | 'TR'
  | 'UA'
  | 'US'
  | string

export type Country =
  | 'United Kingdom'
  | 'United States'
  | 'Australia'
  | 'Canada'
  | 'Germany'
  | 'France'
  | string

export interface ResponseInfo {
  seed: string
  results: number
  page: number
  version: string
}

// Типы для удобства
export type FullName = `${string} ${string}`
