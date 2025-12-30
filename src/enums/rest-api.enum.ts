export enum RestApiEnum {
  MAIN_API = 'https://presentation-backend-neon.vercel.app/api',
}

export type RestApiType = (typeof RestApiEnum)[keyof typeof RestApiEnum];

export enum RestApiCommandEnum {
  RANDOM_JOKE = 'jokes/randomJoke',
  PRODUCT = 'products/randomProduct',
  PERSON = 'persons/randomPerson',
  HEALTH = 'health',
}

export type RestApiCommandType =
  (typeof RestApiCommandEnum)[keyof typeof RestApiCommandEnum];
