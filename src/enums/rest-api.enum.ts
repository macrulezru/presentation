export enum RestApiEnum {
  JOKE = 'https://official-joke-api.appspot.com',
  PRODUCT = '/api',
  PERSON = 'https://randomuser.me',
}

export type RestApiType = (typeof RestApiEnum)[keyof typeof RestApiEnum]

export enum RestApiCommandEnum {
  RANDOM_JOKE = 'random_joke',
  PRODUCT = 'product',
  PERSON = 'api',
}

export type RestApiCommandType =
  (typeof RestApiCommandEnum)[keyof typeof RestApiCommandEnum]
