import {Handle, Position} from "reactflow";
import {memo} from "react";
import moment from "moment/moment";
import {FaRegCircle} from "react-icons/fa";
import {CgCross} from "react-icons/cg";
import {Person} from "@/lib/family/family.model";

const Person = (({data }: { data: Person }) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 w-80">
            <div className="flex items-center">
                <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100">
                    {data.picture}
                </div>
                <div className="ml-2">
                    <div className="text-lg font-bold">{data.lastname}</div>
                    <div className="mt-0">{data.firstname} ({data.age})</div>
                    <div className="flex flex-col mt-2">
                        <div className="text-gray-500 text-xs flex items-center"><FaRegCircle size={8}
                            className="mr-1.5 ml-0.5"/> {data.birthcity}, {data.birthdate.length === 4 ? data.birthdate : moment(data.birthdate).format('DD MMMM YYYY')}</div>
                        {
                            data.deathdate && data.deathdate &&
                            <div className="text-gray-500 text-xs flex items-center"><CgCross
                                className="mr-1"/> {data.deathcity} {data.deathcity ? ', ':''}{data.deathdate.length === 4 ? data.deathdate : moment(data.deathdate).format('DD MMMM YYYY')}
                            </div>
                        }

                    </div>
                </div>
            </div>

            <Handle type="target" position={Position.Top}/>
            <Handle type="source" position={Position.Bottom}/>
        </div>
    )
})

export default memo(Person)