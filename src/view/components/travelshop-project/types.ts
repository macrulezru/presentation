export interface ITravelshopImage {
  image: string;
  hazehash: string;
}

export interface SystemModule {
  image: ITravelshopImage;
  title: string;
  subTitle: string;
  description: string;
  itemsTitle: string;
  items: string[];
}

export type SystemModules = SystemModule[];

export interface Feature {
  icon: string;
  title: string;
  text: string;
}

export interface Project {
  name: string;
  url: string;
  description: string;
}
