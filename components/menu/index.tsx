import {Button, Popover, PopoverContent, PopoverTrigger} from "@nextui-org/react";
import {FaPlus} from "react-icons/fa";
import {FaPerson} from "react-icons/fa6";
import {useState} from "react";

interface MenuProps {
    createPerson: () => void;
}

const Menu = ({createPerson}: MenuProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const createPersonLocal = () => {
        setIsOpen(false);
        createPerson();
    }
    return (
        <Popover placement="bottom"
                 classNames={{
                     content: [
                         "bg-transparent",
                         "shadow-none",
                     ],
                 }}
                 isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}
        >
            <PopoverTrigger>
                <Button color="primary" isIconOnly radius="full" className="shadow-lg"><FaPlus/></Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="px-1 py-2">
                    <Button color="primary" radius="full" className="shadow-lg" onClick={createPersonLocal}><FaPerson/> Person</Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default Menu;