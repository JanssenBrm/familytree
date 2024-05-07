'use client';

import FamilyTree from "@/components/familytree";
import Menu from "@/components/menu";
import {useEffect, useState} from "react";
import EditPersonModal from "../components/modals/editperson";
import {useUiStore} from "@/stores/ui";
import {useFamilyStore} from "@/stores/family";
import {getFamilyData} from "@/lib/family";
import Map from "@/components/map";
import {Tab, Tabs} from "@nextui-org/react";
import { GiFamilyTree } from "react-icons/gi";
import {FaMap} from "react-icons/fa";

export enum Modals {
    NONE,
    NEW_PERSON,
    EDIT_PERSON
}

export enum View {
    MAP = 'map',
    TREE = 'tree'
}

export default function Home() {
    const [modal, setModal] = useState<Modals>(Modals.NONE)
    const [view, setView] = useState<View>(View.TREE)
    const {editPerson, setEditPerson} = useUiStore((state) => state);
    const {people, marriages, children, initFamily} = useFamilyStore((state) => state);

    const familyId = 3;

    useEffect(() => {
        getFamilyData(familyId)
            .then(({people, marriages, children}) => {
                initFamily(people, marriages, children);
            })
    }, []);

    useEffect(() => {
        if (editPerson !== undefined) {
            setModal(Modals.EDIT_PERSON);
        } else {
            setModal(Modals.NONE);
        }
    }, [editPerson])

    const modalClose = () => {
        setEditPerson(undefined);
        setModal(Modals.NONE);
    }
    return (
        <main>
            <div className="absolute top-2 left-2 z-50 w-[96%] md:w-auto flex items-center justify-center">
                <Tabs selectedKey={view} onSelectionChange={(key: any) => setView(key)}>
                    <Tab key={View.TREE} title={
                        <div className="flex items-center space-x-2">
                            <GiFamilyTree />
                            <span>Stamboom</span>
                        </div>
                    }/>
                    <Tab key={View.MAP} title={
                        <div className="flex items-center space-x-2">
                            <FaMap />
                            <span>Kaart</span>
                        </div>
                    }/>
                </Tabs>
            </div>
            {view === View.TREE &&
                <FamilyTree id={familyId} people={people} marriages={marriages} children={children}></FamilyTree>}
            {view === View.MAP &&
                <Map people={people}/>
            }

            <div className="absolute bottom-10 left-[50%]">
                <Menu createPerson={() => setModal(Modals.NEW_PERSON)}></Menu>
            </div>
            {
                (modal === Modals.NEW_PERSON || modal === Modals.EDIT_PERSON) && familyId &&
                <EditPersonModal familyId={familyId} children={children} person={editPerson} marriages={marriages}
                                 members={people} onClose={modalClose}></EditPersonModal>
            }
        </main>
    );
}
