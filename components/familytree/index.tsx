'use client';

import React, {useEffect} from 'react';
import './style.css';
import {getFamilyData} from "@/lib/family";
import {Controls, MiniMap, type Node, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState,} from "reactflow";

import 'reactflow/dist/style.css';
import {generateTreeData, getLayoutedGraph} from "@/components/familytree/utils";
import PersonNode from "@/components/familytree/nodes/person";
import MarriageNode from "@/components/familytree/nodes/marriage";
import {useFamilyStore} from "@/providers/family-store-provider";
import {Person} from "@/stores/family/family.model";
import Search from "@/components/search";

const FamilyTree = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const {initFamily, people, marriages, children} = useFamilyStore((state) => state);

    useEffect(() => {
        getFamilyData(3)
            .then(({people, marriages, children}) => {
                initFamily(people, marriages, children);
            })
    }, []);

    useEffect(() => {
        const {nodes, edges} = generateTreeData(people, marriages, children);
        const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedGraph(nodes, edges);
        setNodes([...layoutedNodes])
        setEdges([...layoutedEdges]);
    }, [people, marriages, children]);


    return (
        <div className='w-screen h-screen' id="graph">
            <Search nodes={nodes.filter(n => n.type === 'member') as Node<Person>[]}></Search>
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={{
                'member': PersonNode,
                'marriage': MarriageNode
            }}
                       fitView
                       className="bg-gray-50"
            >
                <Controls></Controls>
                <MiniMap></MiniMap>
            </ReactFlow>
        </div>
    );
};

const FamilyTreeProvider = () => {
    return (
        <ReactFlowProvider>
            <FamilyTree/>
        </ReactFlowProvider>
    )
}
export default FamilyTreeProvider;
