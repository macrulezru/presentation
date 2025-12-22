export enum RestApiEnum {
  JOKE = 'https://official-joke-api.appspot.com',
  PRODUCT = 'https://dummyjson.com',
  PERSON = 'https://randomuser.me',
}

export type RestApiType = (typeof RestApiEnum)[keyof typeof RestApiEnum]

export enum RestApiCommandEnum {
  RANDOM_JOKE = 'random_joke',
  PRODUCT = 'products',
  PERSON = 'api',
}

export type RestApiCommandType =
  (typeof RestApiCommandEnum)[keyof typeof RestApiCommandEnum]
