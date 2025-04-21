"use client";

import React, { useEffect } from "react";
import "./style.css";
import {
  Controls,
  MiniMap,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";
import {
  generateTreeData,
  getElkLayoutedGraph as getLayoutedGraph,
} from "@/components/familytree/utils";
import PersonNode from "@/components/familytree/nodes/person";
import MarriageNode from "@/components/familytree/nodes/marriage";
import Search from "@/components/search";
import { Child, Marriage, Person } from "@/stores/family/model";

interface FamilyTreeProps {
  id?: number;
  people: Person[];
  marriages: Marriage[];
  childList: Child[];
}

const nodeTypes = {
  member: PersonNode,
  marriage: MarriageNode,
};
const FamilyTree = ({ id, people, marriages, childList }: FamilyTreeProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const { nodes, edges } = generateTreeData(people, marriages, childList);
    getLayoutedGraph(nodes, edges).then(({ nodes, edges }) => {
      setNodes([...nodes]);
      setEdges([...edges]);
    });
  }, [people, marriages, childList, setEdges, setNodes]);

  return (
    <div className="w-screen h-screen" id="graph">
      <Search
        nodes={nodes.filter((n) => n.type === "member") as Node<Person>[]}
      ></Search>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
        minZoom={0}
        onEdgeClick={(event) => {
          console.log(event);
        }}
      >
        <Controls></Controls>
        <MiniMap></MiniMap>
      </ReactFlow>
    </div>
  );
};

const FamilyTreeProvider = ({
  id,
  people,
  marriages,
  childList,
}: FamilyTreeProps) => {
  return (
    <ReactFlowProvider>
      <FamilyTree
        id={id}
        people={people}
        marriages={marriages}
        childList={childList}
      />
    </ReactFlowProvider>
  );
};
export default FamilyTreeProvider;
