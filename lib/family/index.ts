'use server';

import moment from "moment/moment";
import {sql} from "@vercel/postgres";
import {Child, Marriage, Person, PersonBase} from "@/stores/family/model";

const calculateAge = (members: PersonBase[]): Person[] => members.map(m => {
    return {
        ...m,
        age: getAge(m)
    }
})

const getAge = (person: PersonBase): number => {
    let birthYear = person.birthdate.length === 4 ? +person.birthdate : moment(person.birthdate).year();
    let endYear = moment().year();


    if (person.deathdate) {
        if (person.deathdate.length === 4) {
            endYear = +person.deathdate;
        } else {
            endYear = moment(person.deathdate).year();
        }
    }
    return endYear - birthYear;
}

const getPeople = async (id: number): Promise<Person[]> => {
    try {
        const people = await sql<PersonBase>`SELECT *
                                             FROM family_members
                                             WHERE familyid = ${id}`;

        return calculateAge(people.rows)
    } catch (error) {
        console.error('Failed to fetch family people:', error);
        throw new Error(`Failed to fetch family people: ${error}`);
    }

}

const getMarriages = async (id: number): Promise<Marriage[]> => {
    try {
        const result = await sql<Marriage>`SELECT *
                                           FROM family_marriages
                                           WHERE familyid = ${id}`;

        return result.rows;
    } catch (error) {
        console.error('Failed to fetch family marriages', error);
        throw new Error(`Failed to fetch family marriages: ${error}`);
    }

}

const getChildren = async (id: number): Promise<Child[]> => {
    try {
        const result = await sql<Child>`SELECT *
                                        FROM family_children
                                        WHERE familyid = ${id}`;

        return result.rows;
    } catch (error) {
        console.error('Failed to fetch family children', error);
        throw new Error(`Failed to fetch family children: ${error}`);
    }

}
export const getFamilyData = async (id: number) => {
    const people = await getPeople(id);
    const marriages = await getMarriages(id);
    const children: Child[] = await getChildren(id);
    return {
        people,
        marriages,
        children
    }
}

export const createPerson = async (family: number, person: PersonBase): Promise<Person> => {
    try {
        const result = await sql<{ id: number }>`
            INSERT INTO family_members (familyid, firstname, lastname, birthcity, birthdate, deathcity, deathdate,
                                        comments)
            VALUES (${family}, ${person.firstname}, ${person.lastname}, ${person.birthcity}, ${person.birthdate},
                    ${person.deathcity}, ${person.deathdate}, ${person.comments}) RETURNING id`;

        return {
            ...person,
            id: result.rows[0].id,
            age: getAge(person)
        };
    } catch (error) {
        console.error('Failed to create person', error);
        throw new Error(`Failed to create person: ${error}`);
    }
}

export const updatePerson = async (family: number, id: number, person: PersonBase): Promise<Person> => {
    try {
        await sql`
            UPDATE family_members
            SET familyid  = ${family},
                firstname = ${person.firstname},
                lastname  = ${person.lastname},
                birthcity = ${person.birthcity},
                birthdate = ${person.birthdate},
                deathcity = ${person.deathcity},
                deathdate = ${person.deathdate},
                comments  = ${person.comments}
            WHERE id = ${id}`;

        return {
            ...person,
            id,
            age: getAge(person)
        };
    } catch (error) {
        console.error('Failed to update person', error);
        throw new Error(`Failed to update person: ${error}`);
    }
}
export const deletePerson = async (family: number, id: number): Promise<void> => {
    try {
        await sql`
            DELETE FROM family_members
            WHERE id = ${id}`;
    } catch (error) {
        console.error('Failed to delete person', error);
        throw new Error(`Failed to delete person: ${error}`);
    }
}

export const createMarriage = async (family: number, marriage: Marriage): Promise<Marriage> => {
    try {
        const result = await sql<{ id: number }>`
            INSERT INTO family_marriages (familyid, p1, p2, city, date)
            VALUES (${family}, ${marriage.p1}, ${marriage.p2}, ${marriage.city}, ${marriage.date}) RETURNING id`;

        return {
            ...marriage,
            id: result.rows[0].id,
        };
    } catch (error) {
        console.error('Failed to create marriage', error);
        throw new Error(`Failed to create marriage: ${error}`);
    }
}
