export enum RestApiEnum {
  MAIN_API = 'https://api.macrulez.ru/v1',
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
