import {Handle, Position} from "reactflow";
import {memo} from "react";
import moment from "moment/moment";
import {GiBigDiamondRing} from "react-icons/gi";
import {Marriage} from "@/stores/family/family.model";

const Marriage = (({data}: { data: Marriage }) => {
    return (
        <div
            className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 w-60 flex items-center justify-center">
            <GiBigDiamondRing size={32}/>
            <div className="flex flex-col items-center w-full justify-center">
                {data.city && <div className="text-lg font-bold">{data.city}</div>}
                {data.date && <div className="">{moment(data.date).format('DD MMMM YYYY')}</div>}
            </div>

            <Handle type="target" position={Position.Top}/>
            <Handle type="source" position={Position.Bottom}/>
        </div>
    )
})

export default memo(Marriage)