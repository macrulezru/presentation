import { BaseModel } from '@/models/base-model';

export interface ServicesRaw {
  services: ServiceRaw[];
}

export class ServicesModel {
  readonly services: ServiceModel[];

  constructor(raw: ServicesRaw) {
    this.services = Array.isArray(raw.services)
      ? raw.services.filter(s => s.type !== 'seat').map(s => new ServiceModel(s))
      : [];
  }

  getAll(): ServiceModel[] {
    return this.services;
  }

  findById(id: string): ServiceModel | undefined {
    return this.services.find(s => s.id === id);
  }

  filterWithPrice(): ServiceModel[] {
    return ServiceModel.filterWithPrice(this.services);
  }

  sortByPrice(desc = false): ServiceModel[] {
    return ServiceModel.sortByPrice(this.services, desc);
  }

  getRandomServices(): ServiceModel[] {
    const min = 3;
    const max = 5;
    const count = Math.min(
      max,
      Math.max(min, Math.floor(Math.random() * (max - min + 1)) + min),
    );
    return ServiceModel.getRandom(this.services, count);
  }
}

export interface ServiceRaw {
  id?: string;
  name: string;
  price?: number;
  description?: string;
  alert_for_close_text?: string;
  [key: string]: any;
}

export class ServiceModel extends BaseModel<ServiceRaw> {
  readonly id?: string;
  readonly name: string;
  readonly price?: number;
  readonly description?: string;
  readonly alert_for_close_text?: string;

  constructor(raw: ServiceRaw) {
    super(raw);
    this.id = raw.id;
    this.name = raw.name;
    this.price = raw.price;
    this.description =
      typeof raw.description === 'string'
        ? raw.description.replace(/<br\s*\/?>(\r?\n)?/gi, '')
        : raw.description;
    this.alert_for_close_text = raw.alert_for_close_text;
  }

  hasPrice(): boolean {
    return typeof this.price === 'number' && !isNaN(this.price);
  }

  static filterWithPrice(services: ServiceModel[]): ServiceModel[] {
    return services.filter(s => s.hasPrice());
  }

  static getRandom(services: ServiceModel[], count = 1): ServiceModel[] {
    const arr: ServiceModel[] = (Array.isArray(services) ? services : []).filter(
      (s): s is ServiceModel => s instanceof ServiceModel,
    );
    if (arr.length === 0 || count <= 0) return [];
    const result: ServiceModel[] = [];
    const used = new Set<number>();
    const max = Math.min(count, arr.length);
    while (result.length < max) {
      const idx = Math.floor(Math.random() * arr.length);
      if (!used.has(idx) && arr[idx] !== undefined) {
        result.push(arr[idx]);
        used.add(idx);
      }
    }
    return result;
  }

  static findById(services: ServiceModel[], id: string): ServiceModel | undefined {
    return services.find(s => s.id === id);
  }

  static sortByPrice(services: ServiceModel[], desc = false): ServiceModel[] {
    return services.slice().sort((a, b) => {
      if (!a.price) return 1;
      if (!b.price) return -1;
      return desc ? b.price - a.price : a.price - b.price;
    });
  }
}
