import {Child, Marriage, Person} from "@/stores/family/model";
import {Card, CardBody} from "@nextui-org/react";
import {useEffect, useState} from "react";
import clsx from "clsx";


const CustomLabelCard = ({title, value, center}: any) => {
    return (
        <Card>
            <CardBody className={clsx('p-5 min-w-24 ', {
                'items-center': center
            })}>
                    <p className="text-tiny uppercase font-bold mb-2">{title}</p>
                    <div className="text-default-500">{value}</div>
            </CardBody>
        </Card>
    )
}

interface StatisticsProps {
    people: Person[],
    marriages: Marriage[],
    childList: Child[],
}

const Statistics = ({people, marriages, childList}: StatisticsProps) => {

    const [oldest, setOldest] = useState<Person | null>();
    const [youngest, setYoungest] = useState<Person | null>();


    useEffect(() => {
        const getOldest = () => {
            // @ts-ignore
            const sorted = people.filter(p => !!p.age).sort((p1: Person, p2: Person) => p1.age > p2.age ? -1 : 1);
            setOldest(sorted[0])
        }
        const getYoungest = () => {
            // @ts-ignore
            const sorted = people.filter(p => !!p.age).sort((p1: Person, p2: Person) => p1.age > p2.age ? 1 : -1);
            setYoungest(sorted[0])
        }

        getOldest();
        getYoungest();
    }, [people])

    return (
        <div className="bg-gray-50 w-screen h-screen p-14 pt-20">
            <div className="flex gap-5">
                <CustomLabelCard title={"Leden"} value={<span className="text-4xl">{people.length}</span>} center={true}/>
                <CustomLabelCard title={"Huwelijken"} value={<span className="text-4xl">{marriages.length}</span>} center={true}/>
                <CustomLabelCard title={"Oudste persoon"} value={`${oldest?.firstname} ${oldest?.lastname} (${oldest?.age})`}/>
                <CustomLabelCard title={"Jongste persoon"} value={`${youngest?.firstname} ${youngest?.lastname} (${youngest?.age})`}/>
            </div>
        </div>
    )
}

export default Statistics