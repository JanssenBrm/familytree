import {Marriage, Person, PersonBase} from "@/lib/family/family.model";
import {Edge, Node} from "@/lib/family/tree.model";
import moment from "moment/moment";
import {familyData, marriages} from "@/lib/family/data/familiy.data";


const getNodeFromID = (id: string, members: Person[]): Node | undefined => {
    const member = members.find(p => p.id === id);
    if (member) {
        return {
            id: member.id,
            type: 'member',
            data: member,
        }
    } else {
        return undefined;
    }
}


const generateTreeData = (members: Person[], marriages: Marriage[]): { nodes: Node[], edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const processed: string[] = [];

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
                source: p,
                target: marriageId
            })
        })
        nodes.push({
            id: marriageId,
            type: 'marriage',
            data: marriage
        });

        // Process children
        for (const child of (marriage.children || [])) {
            if (!processed.includes(child)) {
                const pNode = getNodeFromID(child, members);
                if (pNode) {
                    nodes.push(pNode);
                    processed.push(child);
                }
            }
            edges.push({
                id: `child-edge-${child}`,
                source: marriageId,
                target: child,
            })
        }
    }

    return {
        nodes,
        edges
    }
};

const calculateAge = (members: PersonBase[]): Person[] => members.map(m => {
    let birthYear = m.birthDate.length === 4 ? +m.birthDate : moment(m.birthDate).year();
    let endYear = moment().year();


    if (m.deathDate) {
        if (m.deathDate.length === 4) {
            endYear = +m.deathDate;
        } else {
            endYear = moment(m.deathDate).year();
        }
    }
    return {
        ...m,
        age: endYear - birthYear,
    }
})
export const getFamilyData = async () => {
    const agedMembers = calculateAge(familyData);
    return generateTreeData(agedMembers, marriages);
}