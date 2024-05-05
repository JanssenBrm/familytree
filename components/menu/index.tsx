import {Button, Popover, PopoverContent, PopoverTrigger} from "@nextui-org/react";
import {FaPlus} from "react-icons/fa";
import {FaPerson} from "react-icons/fa6";

const Menu = () => {
    return (
        <Popover placement="bottom"
                 classNames={{
                     content: [
                         "bg-transparent",
                         "shadow-none",
                     ],
                 }}
        >
            <PopoverTrigger>
                <Button color="primary" isIconOnly radius="full" className="shadow-lg"><FaPlus/></Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="px-1 py-2">
                    <Button color="primary" radius="full" className="shadow-lg"><FaPerson/> Person</Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default Menu;