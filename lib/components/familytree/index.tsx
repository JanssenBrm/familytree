'use client';

import React, {useEffect, useState} from 'react';
import './style.css';
import {getFamilyData} from "@/lib/family";
import {Controls, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow} from "reactflow";
import {Edge, Node} from "@/lib/family/tree.model";

import 'reactflow/dist/style.css';
import {generateTreeData, getLayoutedGraph, nodeDims} from "@/lib/components/familytree/utils";
import PersonNode from "@/lib/components/familytree/nodes/person";
import MarriageNode from "@/lib/components/familytree/nodes/marriage";
import {FaRegCircle} from "react-icons/fa";
import moment from "moment";
import {useFamilyStore} from "@/providers/family-store-provider";

const FamilyTree = () => {

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [search, setSearch] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Node[]>([]);
    const { initFamily, people, marriages, children } = useFamilyStore((state) => state);

    const {setCenter} = useReactFlow();

    const zoomToNode = (node: Node) => {
        setSearch('');
        // @ts-ignore
        const x = (node.position?.x || 0) + nodeDims[node.type].width / 2;
        // @ts-ignore
        const y = (node.position?.y || 0) + nodeDims[node.type]?.height / 2;
        const zoom = 1.85;

        setCenter(x, y, {zoom, duration: 1000});
    }

    useEffect(() => {
        getFamilyData(3)
            .then(({people, marriages, children}) => {
                initFamily(people, marriages, children);
            })
    }, []);

    useEffect(() => {
        const { nodes, edges } = generateTreeData(people, marriages, children);
        const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedGraph(nodes, edges);
        setNodes([...layoutedNodes])
        setEdges([...layoutedEdges]);
    }, [people, marriages, children]);

    useEffect(() => {
        if (search !== '') {
            setSearchResults(nodes.filter(n => n.data?.firstname?.toLowerCase().includes(search.toLowerCase()) ||
                n.data?.lastname?.toLowerCase().includes(search.toLowerCase()) ||
                n.data?.comments?.toLowerCase().includes(search.toLowerCase())
            ));
        } else {
            setSearchResults([]);
        }
    }, [search])


    return (
        <div className='w-screen h-screen' id="graph">
            <div className="absolute top-2 right-2 z-50 left-2 w-[96%] md:w-80 md:left-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input type="search" id="default-search"
                           className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="Zoeken..." onKeyUp={(evt) => setSearch(evt.target.value)}/>
                </div>
                {
                    search && search !== '' && (
                        <div className="w-full flex flex-col shadow-md"> {
                            searchResults.length === 0 ? (
                                <span className="p-3 bg-white w-full">No results</span>
                            ) : searchResults.map((n: Node) => (
                                <div className="p-3 bg-white w-full hover:bg-gray-50 hover:cursor-pointer"
                                     onClick={() => zoomToNode(n)}>
                                    <span>{n.data?.lastname} {n.data?.firstname}</span>
                                    <div className="text-gray-500 text-xs flex items-center">
                                        <FaRegCircle size={8}
                                                     className="mr-1.5 ml-0.5"/> {n.data?.birthcity}, {n.data?.birthdate.length === 4 ? n.data?.birthdate : moment(n.data?.birthdate).format('DD MMMM YYYY')}
                                    </div>
                                </div>
                            ))
                        }
                        </div>
                    )
                }
            </div>
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
