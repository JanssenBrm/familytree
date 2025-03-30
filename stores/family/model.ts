export interface PersonBase {
  id?: number;
  picture?: string;
  firstname: string;
  lastname: string;
  birthcity?: string;
  birthcountry?: string;
  birthdate?: string;
  deathcity?: string;
  deathcountry?: string;
  deathdate?: string;
  comments?: string;
}

export interface Person extends PersonBase {
  age?: number;
  disconnected?: boolean;
}

export interface Marriage {
  id?: number;
  p1?: number;
  p2?: number;
  city?: string;
  date?: string;
}

export interface Child {
  id?: number;
  marriageid: number;
  childid: number;
}

export interface FamilyManager {
  id: number;
  name: string;
  email: string;
  password: string;
}
