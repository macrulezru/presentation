export enum pageSectionsEnum {
  SPLASH = 'splash',
  ABOUT = 'about',
  EXPERIENCE = 'experience',
  TRAVELSHOP = 'travelshop',
  FEATURES = 'features',
  REMOTE_WORKPLACE = 'remoteWorkplace',
  CONTACTS = 'contacts',
}

export type pageSectionsType = (typeof pageSectionsEnum)[keyof typeof pageSectionsEnum]
