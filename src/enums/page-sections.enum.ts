export enum PageSectionsEnum {
  SPLASH = 'splash',
  ABOUT = 'about',
  EXPERIENCE = 'experience',
  TRAVELSHOP = 'travelshop',
  FEATURES = 'features',
  STUFF = 'stuff',
  ARTS = 'arts',
  REMOTE_WORKPLACE = 'remote-workplace',
  CONTACTS = 'contacts',
  BLOG = 'blog',
}

export type PageSectionsType = (typeof PageSectionsEnum)[keyof typeof PageSectionsEnum];
