import { BaseModel } from '@/models/base-model';

export interface SeatRaw {
  freetext: string;
  class?: string;
  available?: string;
  [key: string]: any;
  props?: string;
}

export class SeatModel extends BaseModel<SeatRaw> {
  readonly freetext: string;
  readonly seatClass?: string;
  readonly available: boolean;
  readonly props: string[];

  constructor(raw: SeatRaw) {
    super(raw);
    this.freetext = raw.freetext;
    this.seatClass = raw.class;
    this.available = raw.available === 'Y';
    this.props = raw.props ? raw.props.split(',').map(p => p.trim()) : [];
  }
}

export interface RowRaw {
  cells: SeatRaw[];
  [key: string]: any;
}

export interface CabinRaw {
  rows: RowRaw[];
  [key: string]: any;
}

export interface SegmentSeatMapRaw {
  cabins: CabinRaw[];
  [key: string]: any;
}

export interface SeatMapRaw {
  segments: SegmentSeatMapRaw[];
  [key: string]: any;
}

export class SeatMapModel extends BaseModel<SeatMapRaw> {
  readonly seats: SeatModel[];

  constructor(raw: SeatMapRaw) {
    super(raw);
    this.seats = [];
    if (Array.isArray(raw.segments)) {
      for (const seg of raw.segments) {
        if (Array.isArray(seg.cabins)) {
          for (const cabin of seg.cabins) {
            if (Array.isArray(cabin.rows)) {
              for (const row of cabin.rows) {
                if (Array.isArray(row.cells)) {
                  this.seats.push(...row.cells.map(cell => new SeatModel(cell)));
                }
              }
            }
          }
        }
      }
    }
  }

  getAvailableSeats(): SeatModel[] {
    return this.seats.filter(seat => seat.available);
  }

  getRandomAvailableSeat(): SeatModel | null {
    const available = this.getAvailableSeats();
    if (available.length === 0) return null;

    const value = available[Math.floor(Math.random() * available.length)];
    return value === undefined ? null : value;
  }

  findSeatByFreetext(freetext: string): SeatModel | undefined {
    return this.seats.find(seat => seat.freetext === freetext);
  }
}
