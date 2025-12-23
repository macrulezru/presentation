export enum RestApiEnum {
  JOKE = 'https://official-joke-api.appspot.com',
  PRODUCT = 'https://presentation-api-njrj.onrender.com/api/v1',
  PERSON = 'https://randomuser.me',
}

export type RestApiType = (typeof RestApiEnum)[keyof typeof RestApiEnum]

export enum RestApiCommandEnum {
  RANDOM_JOKE = 'random_joke',
  PRODUCT = 'randomProduct',
  PERSON = 'api',
}

export type RestApiCommandType =
  (typeof RestApiCommandEnum)[keyof typeof RestApiCommandEnum]
