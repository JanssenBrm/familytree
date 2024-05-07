import {Node, useReactFlow} from "reactflow";
import {FaRegCircle, FaSearch} from "react-icons/fa";
import moment from "moment/moment";
import React, {useEffect, useState} from "react";
import {Person} from "@/stores/family/family.model";
import {nodeDims} from "@/components/familytree/utils";
import {Input, ScrollShadow} from "@nextui-org/react";

interface SearchProps {
    nodes: Node<Person>[],
}

const Search = ({nodes}: SearchProps) => {

    const [search, setSearch] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Node<Person>[]>([]);

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
        <div className="absolute top-14 md:top-2 right-2 z-50 left-2 w-[96%] md:w-80 md:left-auto">
            <Input
                isClearable
                placeholder="Zoeken..."
                value={search}
                onValueChange={setSearch}
                size="md"
                variant="bordered"
                className="bg-white"
                startContent={
                    <FaSearch/>
                }
            />
            {
                search && search !== '' && (
                    <ScrollShadow className="w-full flex flex-col shadow-md max-h-[90vh] overflow-auto"> {
                        searchResults.length === 0 ? (
                            <span className="p-3 bg-white w-full">No results</span>
                        ) : searchResults.map((n: Node, idx: number) => (
                            <div key={`search-result-node-${idx}`}
                                 className="p-3 bg-white w-full hover:bg-gray-50 hover:cursor-pointer"
                                 onClick={() => zoomToNode(n)}>
                                <span>{n.data?.lastname} {n.data?.firstname}</span>
                                <div className="text-gray-500 text-xs flex items-center">
                                    <FaRegCircle size={8}
                                                 className="mr-1.5 ml-0.5"/> {n.data?.birthcity}, {n.data?.birthdate.length === 4 ? n.data?.birthdate : moment(n.data?.birthdate).format('DD MMMM YYYY')}
                                </div>
                            </div>
                        ))
                    }
                    </ScrollShadow>
                )
            }
        </div>
    )
}

export default Search;