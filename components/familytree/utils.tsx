import dagre from "@dagrejs/dagre";
import { type Node, type Edge } from "reactflow";
import { Child, Marriage, Person } from "@/stores/family/model";
import ELK, { ElkNode } from "elkjs";

export const nodeDims = {
  marriage: {
    width: 284,
    height: 100,
  },
  member: {
    width: 284,
    height: 144,
  },
};
export const getDagreLayoutedGraph = (
  nodes: Node[],
  edges: Edge[]
): { nodes: Node<any>[]; edges: Edge[] } => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach((node: Node) => {
    dagreGraph.setNode(node.id, {
      // @ts-ignore
      width: nodeDims[node.type].width,
      // @ts-ignore
      height: nodeDims[node.type].height,
    });
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

  return { nodes, edges };
};

export const getElkLayoutedGraph = async (
  nodes: Node[],
  edges: Edge[]
): Promise<{ nodes: Node<any>[]; edges: Edge[] }> => {
  const elk = new ELK();
  const elkGraph: ElkNode = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "50", // Increase spacing between nodes
      "elk.layered.spacing.nodeNodeBetweenLayers": "50", // Increase spacing between layers
      "elk.layered.considerModelOrder.strategy": "PREFER_EDGES", // Optimize for tree-like structures
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX", // Better placement for hierarchical trees
    },
    children: nodes.map((node) => ({
      id: node.id,
      // @ts-ignore
      width: nodeDims[node.type].width,
      // @ts-ignore
      height: nodeDims[node.type].height,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layout = await elk.layout(elkGraph);

  const updatedNodes = nodes.map((node) => {
    const elkNode = layout.children?.find((n) => n.id === node.id);
    if (elkNode) {
      node.position = {
        // @ts-ignore
        x: (elkNode.x || 0) - nodeDims[node.type].width / 2,
        // @ts-ignore
        y: (elkNode.y || 0) - nodeDims[node.type].height / 2,
      };
    }
    return node;
  });

  return { nodes: updatedNodes, edges };
};

const createPersonNode = (
  person: Person,
  disconnected: boolean
): Node<Person> => ({
  id: `${person.id}`,
  type: "member",
  position: {
    x: 0,
    y: 0,
  },
  data: {
    ...person,
    disconnected,
  },
});

const getNodeFromID = (
  id: number,
  members: Person[],
  disconnected: boolean
): Node | undefined => {
  const person = members.find((p) => p.id === id);
  if (person) {
    return createPersonNode(person, disconnected);
  } else {
    return undefined;
  }
};

export const generateTreeData = (
  members: Person[],
  marriages: Marriage[],
  children: Child[]
): {
  nodes: Node<Person>[];
  edges: Edge[];
} => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const processed: number[] = [];
  let unknownIdx = Math.max(...members.map((p) => p.id || 0)) + 1;

  for (const marriage of marriages) {
    // Process marriage
    const marriageId = `marriage-${marriage.p1}-${marriage.p2}`;
    [marriage.p1, marriage.p2].forEach((p) => {
      const personId = p || unknownIdx;
      if (!p || !processed.includes(p)) {
        let pNode;
        if (!!p) {
          pNode = getNodeFromID(p, members, false);
        } else {
          pNode = createPersonNode(
            {
              id: personId,
              firstname: "Onbekend",
              lastname: "Onbekend",
            },
            false
          );
          unknownIdx = unknownIdx + 1;
        }
        if (pNode) {
          nodes.push(pNode);
          processed.push(personId);
        }
      }
      edges.push({
        id: `marriage-edge-${personId}`,
        source: `${personId}`,
        target: marriageId,
      });
    });
    nodes.push({
      id: marriageId,
      type: "marriage",
      position: {
        x: 0,
        y: 0,
      },
      data: marriage,
    });

    // Process children
    const marriageChildren = children.filter(
      (c) => c.marriageid === marriage.id
    );
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
        target: `${child.childid}`,
      });
    }
  }

  // Processing those nodes that are not connected
  const disconnected: Person[] = members.filter(
    (m: Person) => !processed.includes(m.id || 0)
  );

  for (const person of disconnected) {
    nodes.push(createPersonNode(person, true));
  }

  return {
    nodes,
    edges,
  };
};
