'use client';

import React, {useEffect} from 'react';
import './style.css';
import {Controls, MiniMap, type Node, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState,} from "reactflow";

import 'reactflow/dist/style.css';
import {generateTreeData, getLayoutedGraph} from "@/components/familytree/utils";
import PersonNode from "@/components/familytree/nodes/person";
import MarriageNode from "@/components/familytree/nodes/marriage";
import Search from "@/components/search";
import {Child, Marriage, Person} from "@/stores/family/model";

interface FamilyTreeProps {
    id?: number,
    people: Person[],
    marriages: Marriage[],
    children: Child[]
}

const nodeTypes = {
    'member': PersonNode,
    'marriage': MarriageNode
}
const FamilyTree = ({id, people, marriages, children}: FamilyTreeProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const {nodes, edges} = generateTreeData(people, marriages, children);
        const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedGraph(nodes, edges);
        setNodes([...layoutedNodes])
        setEdges([...layoutedEdges]);
    }, [people, marriages, children]);


    return (
        <div className='w-screen h-screen' id="graph">
            <Search nodes={nodes.filter(n => n.type === 'member') as Node<Person>[]}></Search>
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}
                       fitView
                       className="bg-gray-50"
            >
                <Controls></Controls>
                <MiniMap></MiniMap>
            </ReactFlow>
        </div>
    );
}


const FamilyTreeProvider = ({id, people, marriages, children}: FamilyTreeProps) => {
    return (
        <ReactFlowProvider>
            <FamilyTree id={id} people={people} marriages={marriages} children={children}/>
        </ReactFlowProvider>
    )
}
export default FamilyTreeProvider;
