'use server';

import {Child, Marriage, Person, PersonBase} from "@/lib/family/family.model";
import {Edge, Node} from "@/lib/family/tree.model";
import moment from "moment/moment";
import {sql} from "@vercel/postgres";


const getNodeFromID = (id: number, members: Person[]): Node | undefined => {
    const member = members.find(p => p.id === id);
    if (member) {
        return {
            id: `${member.id}`,
            type: 'member',
            data: member,
        }
    } else {
        return undefined;
    }
}


const generateTreeData = (members: Person[], marriages: Marriage[], children: Child[]): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const processed: number[] = [];

    for (const marriage of marriages) {
        // Process marriage
        const marriageId = `marriage-${marriage.p1}-${marriage.p2}`;
        [marriage.p1, marriage.p2].forEach((p) => {
            if (!processed.includes(p)) {
                const pNode = getNodeFromID(p, members);
                if (pNode) {
                    nodes.push(pNode);
                    processed.push(p);
                }
            }
            edges.push({
                id: `marriage-edge-${p}`,
                source: `${p}`,
                target: marriageId
            })
        })
        nodes.push({
            id: marriageId,
            type: 'marriage',
            data: marriage
        });

        // Process children
        const marriageChildren = children.filter(c => c.marriageid ===  marriage.id)
        for (const child of marriageChildren) {
            if (!processed.includes(child.childid)) {
                const pNode = getNodeFromID(child.childid, members);
                if (pNode) {
                    nodes.push(pNode);
                    processed.push(child.childid);
                }
            }
            edges.push({
                id: `child-edge-${child}`,
                source: marriageId,
                target: `${child.childid}`
            })
        }
    }

    return {
        nodes,
        edges
    }
};

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

const getMembers = async (id: number): Promise<Person[]> => {
    try {
        const members = await sql<PersonBase>`SELECT *
                                              FROM family_members
                                              WHERE familyid = ${id}`;

        return calculateAge(members.rows)
    } catch (error) {
        console.error('Failed to fetch family members:', error);
        throw new Error(`Failed to fetch family members: ${error}`);
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
    const members = await getMembers(id);
    const marriages = await getMarriages(id);
    const children: Child[] = await getChildren(id);
    console.log("DATA", members, marriages, children);
    return generateTreeData(members, marriages, children);
}