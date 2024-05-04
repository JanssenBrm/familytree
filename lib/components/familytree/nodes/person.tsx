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
                    <div className="text-lg font-bold">{data.lastName}</div>
                    <div className="mt-0">{data.firstName} ({data.age})</div>
                    <div className="flex flex-col mt-2">
                        <div className="text-gray-500 text-xs flex items-center"><FaRegCircle size={8}
                            className="mr-1.5 ml-0.5"/> {data.birthCity}, {data.birthDate.length === 4 ? data.birthDate : moment(data.birthDate).format('DD MMMM YYYY')}</div>
                        {
                            data.deathDate && data.deathDate &&
                            <div className="text-gray-500 text-xs flex items-center"><CgCross
                                className="mr-1"/> {data.deathCity} {data.deathCity ? ', ':''}{data.deathDate.length === 4 ? data.deathDate : moment(data.deathDate).format('DD MMMM YYYY')}
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