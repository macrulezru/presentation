export enum PageSectionsEnum {
  SPLASH = 'splash',
  ABOUT = 'about',
  EXPERIENCE = 'experience',
  TRAVELSHOP = 'travelshop',
  FEATURES = 'features',
  ARTS = 'arts',
  REMOTE_WORKPLACE = 'remote-workplace',
  CONTACTS = 'contacts',
}

export type PageSectionsType = (typeof PageSectionsEnum)[keyof typeof PageSectionsEnum];
