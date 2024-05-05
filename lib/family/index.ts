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