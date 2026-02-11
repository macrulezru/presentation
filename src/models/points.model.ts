import { BaseModel } from '@/models/base-model';

export interface PointRaw {
  point_code: string;
  point_name: string;
  point_name_ru: string;
  city_code: string;
  city_name: string;
  city_name_ru: string;
  airport: boolean;
  own_route: boolean;
  interline_route: boolean;
  popular: boolean;
  weight: number;
  country_code: string;
  departure_to?: string;
  arrival_from?: string;
  meta?: {
    revision: number;
    created: number;
    version: number;
  };
  $loki?: number;
}

export class PointModel extends BaseModel<PointRaw> {
  readonly code: string;
  readonly name: string;
  readonly nameRu: string;

  constructor(raw: PointRaw) {
    super(raw);
    this.code = raw.point_code;
    this.name = raw.point_name;
    this.nameRu = raw.point_name_ru || raw.point_name;
  }

  getDepartures(): string[] {
    const dep = this.raw.departure_to;
    if (!dep || typeof dep !== 'string') return [];
    return dep
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  hasDepartureTo(code: string): boolean {
    return this.getDepartures().includes(code);
  }

  getRandomDeparture(): string | null {
    const deps = this.getDepartures();
    if (deps.length === 0) return null;
    const value = deps[Math.floor(Math.random() * deps.length)];
    return value === undefined ? null : value;
  }

  static findByCode(points: PointModel[], code: string): PointModel | undefined {
    return points.find(p => p.code === code);
  }

  static getRandom(points: PointModel[]): PointModel | null {
    if (!Array.isArray(points) || points.length === 0) return null;
    const value = points[Math.floor(Math.random() * points.length)];
    return value === undefined ? null : value;
  }
}

export interface PointsRaw {
  points: PointRaw[];
}

export class PointsModel {
  readonly points: PointModel[];

  constructor(raw: PointsRaw) {
    this.points = Array.isArray(raw.points) ? raw.points.map(p => new PointModel(p)) : [];
  }

  findByCode(code: string): PointModel | undefined {
    return this.points.find(p => p.code === code);
  }

  findByPointCode(pointCode?: string): PointModel | undefined {
    return this.points.find(p => p.raw.point_code === pointCode);
  }

  filterByCountry(countryCode: string): PointModel[] {
    return this.points.filter(p => p.raw.country_code === countryCode);
  }

  getAllCodes(): string[] {
    return this.points.map(p => p.code);
  }

  getRandomPoint(): PointModel | null {
    if (!this.points.length) return null;
    const idx = Math.floor(Math.random() * this.points.length);
    return this.points[idx] || null;
  }

  getRandomPointExcept(excludedCode?: string): PointModel | null {
    if (!this.points.length) return null;
    const available = excludedCode
      ? this.points.filter(p => p.code !== excludedCode)
      : this.points;
    if (!available.length) return null;
    const idx = Math.floor(Math.random() * available.length);
    return available[idx] || null;
  }
}
