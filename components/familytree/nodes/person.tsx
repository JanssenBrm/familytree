import {Handle, Position} from "reactflow";
import {memo} from "react";
import moment from "moment/moment";
import {FaRegCircle} from "react-icons/fa";
import {CgCross} from "react-icons/cg";
import {Person} from "@/stores/family/model";
import clsx from "clsx";
import {useUiStore} from "@/stores/ui";

const Person = (({data}: { data: Person }) => {
    const {setEditPerson} = useUiStore((state) => state);


    return (
        <div
            className={clsx("px-4 py-2 min-h-28 shadow-md rounded-md w-80 hover:cursor-pointer", {
                    "border-red-500 border-3 bg-red-50": !!data.disconnected,
                    "border-gray-200 border-2 bg-white": !data.disconnected
                }
            )}
            onClick={() => setEditPerson(data)}
        >
            <div className="flex items-center">
                <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
                    {data.picture}
                </div>
                <div className="ml-2">
                    <div className="text-lg font-bold">{data.lastname}</div>
                    <div className="mt-0">{data.firstname} {data.age ? `(${data.age})` : ''}</div>
                    <div className="flex flex-col mt-2">
                        <div className="text-gray-500 text-xs flex items-center"><FaRegCircle size={8}
                                                                                              className="mr-1.5 ml-0.5"/>
                            {data.birthdate ? (data.birthdate.length === 4 ? data.birthdate : moment(data.birthdate).format('DD/MM/YYYY')) : 'Onbekend'}, {data.birthcity || 'Onbekend'}
                        </div>

                        <div className="text-gray-500 text-xs flex items-center"><CgCross
                            className="mr-1"/>
                            {data.deathdate ? (data.deathdate.length === 4 ? data.deathdate : moment(data.deathdate).format('DD/MM/YYYY')) : 'Onbekend'}, {data.deathcity || 'Onbekend'}
                        </div>
                    </div>
                </div>
            </div>

            <Handle type="target" position={Position.Top}/>
            <Handle type="source" position={Position.Bottom}/>
        </div>
    )
})

export default memo(Person)