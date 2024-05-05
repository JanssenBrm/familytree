'use server';

import {Child, Marriage, Person, PersonBase} from "@/stores/family/family.model";
import moment from "moment/moment";
import {sql} from "@vercel/postgres";
const calculateAge = (members: PersonBase[]): Person[] => members.map(m => {
    let birthYear = m.birthdate.length === 4 ? +m.birthdate : moment(m.birthdate).year();
    let endYear = moment().year();


    if (m.deathdate) {
        if (m.deathdate.length === 4) {
            endYear = +m.deathdate;
        } else {
            endYear = moment(m.deathdate).year();
        }
    }
    return {
        ...m,
        age: endYear - birthYear,
    }
})

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