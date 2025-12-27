import type {
  Person,
  UserName,
  Location,
  Login,
  DateInfo,
  UserId,
  Picture,
} from '@/core/rest-interface/person';

import { BaseModel } from '@/models/base-model';

export class PersonModel extends BaseModel {
  readonly gender: Person['gender'];
  readonly name: UserName;
  readonly location: Location;
  readonly email: string;
  readonly login: Login;
  readonly dob: DateInfo;
  readonly registered: DateInfo;
  readonly phone: string;
  readonly cell: string;
  readonly id: UserId;
  readonly picture: Picture;
  readonly nat: Person['nat'];

  constructor(raw: Person) {
    super(raw);

    this.gender = raw.gender;
    this.name = raw.name;
    this.location = raw.location;
    this.email = raw.email;
    this.login = raw.login;
    this.dob = raw.dob;
    this.registered = raw.registered;
    this.phone = raw.phone;
    this.cell = raw.cell;
    this.id = raw.id;
    this.picture = raw.picture;
    this.nat = raw.nat;
  }

  // Геттеры для удобства
  get fullName(): string {
    return `${this.name.title} ${this.name.first} ${this.name.last}`.trim();
  }

  get shortName(): string {
    return `${this.name.first} ${this.name.last}`;
  }

  get age(): number {
    return this.dob.age;
  }

  get registrationAge(): number {
    return this.registered.age;
  }

  get locationString(): string {
    return `${this.location.city}, ${this.location.state}, ${this.location.country}`;
  }

  get streetAddress(): string {
    return `${this.location.street.number} ${this.location.street.name}`;
  }

  get profilePicture(): string {
    return this.picture.large;
  }

  get thumbnail(): string {
    return this.picture.thumbnail;
  }
}
