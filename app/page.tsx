'use client';

import FamilyTree from "@/components/familytree";
import Menu from "@/components/menu";
import {Suspense, useEffect, useState} from "react";
import EditPersonModal from "../components/modals/editperson";
import {useUiStore} from "@/stores/ui";
import {useFamilyStore} from "@/stores/family";
import {getFamilyData} from "@/lib/family";
import Map from "@/components/map";
import {Tab, Tabs} from "@nextui-org/react";
import {GiFamilyTree} from "react-icons/gi";
import {FaChartArea, FaMap} from "react-icons/fa";
import Statistics from "@/components/statistics";
import LoadingModal from "@/components/modals/loading";
import {ToastType} from "@/stores/toasts/model";
import {useToastsStore} from "@/stores/toasts";

enum Modals {
    NONE,
    NEW_PERSON,
    EDIT_PERSON
}

enum View {
    MAP = 'map',
    TREE = 'tree',
    STATISTICS = 'statistics'
}

function HomePage() {
    const [modal, setModal] = useState<Modals>(Modals.NONE)
    const [view, setView] = useState<View>(View.TREE)
    const {editPerson, setEditPerson} = useUiStore((state) => state);
    const {people, marriages, children, initFamily} = useFamilyStore((state) => state);
    const [loading, setLoading] = useState<boolean>(true);
    const {addToast} = useToastsStore((state) => state);
    const [familyId, setFamilyId] = useState<number>();
    const editEnabled = false;

    useEffect(() => {
        const familyId = 3;
        if (!!familyId) {
            console.log('Loading family with ID', familyId);
            setFamilyId(+familyId);
            setLoading(true);
            getFamilyData(+familyId)
                .then(({people, marriages, children}) => {
                    initFamily(people, marriages, children);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error(`Could load family`, error);
                    addToast({
                        message: `Sorry! Kon jouw familie niet laden`,
                        type: ToastType.ERROR
                    });
                    setLoading(false);
                })
        } else {
            console.warn('No family ID set', familyId);
        }
    }, [addToast, initFamily]);


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
                            <GiFamilyTree/>
                            <span>Stamboom</span>
                        </div>
                    }/>
                    <Tab key={View.MAP} title={
                        <div className="flex items-center space-x-2">
                            <FaMap/>
                            <span>Kaart</span>
                        </div>
                    }/>
                    <Tab key={View.STATISTICS} title={
                        <div className="flex items-center space-x-2">
                            <FaChartArea/>
                            <span>Statistieken</span>
                        </div>
                    }/>
                </Tabs>
            </div>
            {view === View.TREE && familyId &&
                <FamilyTree id={familyId} people={people} marriages={marriages} childList={children}></FamilyTree>}
            {view === View.MAP &&
                <Map people={people}/>
            }

            {view === View.STATISTICS &&
                <Statistics people={people} marriages={marriages} childList={children}/>
            }

            {
                loading && familyId && <LoadingModal/>
            }

            {editEnabled ?
                <>
                    <div className="absolute bottom-10 left-[50%]">
                        <Menu createPerson={() => setModal(Modals.NEW_PERSON)}></Menu>
                    </div>
                    {
                        (modal === Modals.NEW_PERSON || modal === Modals.EDIT_PERSON) && familyId &&
                        <EditPersonModal familyId={familyId} childList={children} person={editPerson}
                                         marriages={marriages}
                                         members={people} onClose={modalClose}></EditPersonModal>
                    }
                </> : ''
            }
        </main>
    );
}

export default function Home() {
    return <Suspense>
        <HomePage></HomePage>
    </Suspense>
}
