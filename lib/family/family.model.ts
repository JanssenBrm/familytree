
export interface PersonBase {
    id: string;
    picture?: string;
    firstName: string;
    lastName: string;
    birthCity: string;
    birthDate: string;
    deathCity?: string;
    deathDate?: string;
    comments?: string;
}

export interface Person extends PersonBase {
    age: number;
}

export interface Marriage {
    p1: string;
    p2: string;
    children?: string[];
    city?: string;
    date?: string;
}

