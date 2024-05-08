import dagre from '@dagrejs/dagre';
import {type Node, type Edge} from "reactflow";
import {Child, Marriage, Person} from "@/stores/family/model";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));


export const nodeDims = {
    'marriage': {
        width: 204,
        height: 100,
    },
    'member': {
        width: 284,
        height: 144,
    }
}
export const getLayoutedGraph = (nodes: Node[], edges: Edge[]): { nodes: Node<any>[], edges: Edge[] } => {


    dagreGraph.setGraph({rankdir: 'TB'});

    nodes.forEach((node: Node) => {
        // @ts-ignore
        dagreGraph.setNode(node.id, {width: nodeDims[node.type].width, height: nodeDims[node.type].height});
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node: Node<Person>) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.position = {
            // @ts-ignore
            x: nodeWithPosition.x - nodeDims[node.type].width / 2,
            // @ts-ignore
            y: nodeWithPosition.y - nodeDims[node.type].height / 2,
        };

        return node;
    });


    return {nodes, edges};
}

const createPersonNode = (person: Person, disconnected: boolean): Node<Person> => ({
    id: `${person.id}`,
    type: 'member',
    position: {
        x: 0,
        y: 0
    },
    data: {
        ...person,
        disconnected,
    },
})

const getNodeFromID = (id: number, members: Person[], disconnected: boolean): Node | undefined => {
    const person = members.find(p => p.id === id);
    if (person) {
        return createPersonNode(person, disconnected)
    } else {
        return undefined;
    }
}


export const generateTreeData = (members: Person[], marriages: Marriage[], children: Child[]): {
    nodes: Node<Person>[],
    edges: Edge[]
} => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const processed: number[] = [];

    for (const marriage of marriages) {
        // Process marriage
        const marriageId = `marriage-${marriage.p1}-${marriage.p2}`;
        [marriage.p1, marriage.p2].forEach((p) => {
            if (!processed.includes(p) && p !== 0) {
                const pNode = getNodeFromID(p, members, false);
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
            position: {
                x: 0,
                y: 0
            },
            data: marriage
        });

        // Process children
        const marriageChildren = children.filter(c => c.marriageid === marriage.id)
        for (const child of marriageChildren) {
            if (!processed.includes(child.childid)) {
                const pNode = getNodeFromID(child.childid, members, false);
                if (pNode) {
                    nodes.push(pNode);
                    processed.push(child.childid);
                }
            }
            edges.push({
                id: `child-edge-${child.marriageid}-${child.childid}`,
                source: marriageId,
                target: `${child.childid}`
            })
        }
    }

    // Processing those nodes that are not connected
    const disconnected: Person[] = members.filter((m: Person) => !processed.includes(m.id || 0));

    for (const person of disconnected) {
        nodes.push(createPersonNode(person, true))
    }

    return {
        nodes,
        edges
    }
};
