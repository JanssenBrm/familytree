import {Edge, Node} from "@/lib/family/tree.model";
import dagre from '@dagrejs/dagre';
import {Child, Marriage, Person} from "@/stores/family/family.model";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));


export const nodeDims = {
    'marriage': {
        width: 172,
        height: 52,
    },
    'member': {
        width: 284,
        height: 94,
    }
}
export const getLayoutedGraph = (nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[] } => {

    dagreGraph.setGraph({rankdir: 'TB'});

    nodes.forEach((node: Node) => {
        console.log(node.type);
        // @ts-ignore
        dagreGraph.setNode(node.id, {width: nodeDims[node.type].width, height: nodeDims[node.type].height});
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node: Node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = 'top';
        node.sourcePosition = 'bottom';
        node.position = {
            x: nodeWithPosition.x - nodeDims[node.type].width / 2,
            y: nodeWithPosition.y - nodeDims[node.type].height / 2,
        };

        return node;
    });


    return {nodes, edges};
}

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
export const generateTreeData = (members: Person[], marriages: Marriage[], children: Child[]): { nodes: Node[], edges: Edge[] } => {
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
        const marriageChildren = children.filter(c => c.marriageid === marriage.id)
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
