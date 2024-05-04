import {Edge, Node} from "@/lib/family/tree.model";
import dagre from '@dagrejs/dagre';

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
export const getLayoutedGraph = (nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[]} => {

    dagreGraph.setGraph({ rankdir: 'TB' });

    nodes.forEach((node: Node) => {
        console.log(node.type);
        dagreGraph.setNode(node.id, { width: nodeDims[node.type].width, height: nodeDims[node.type].height });
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


    return { nodes, edges };
}
