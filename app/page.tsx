'use client';

import Image from "next/image";
import FamilyTree from "@/components/familytree";
import Search from "@/components/search";
import Menu from "@/components/menu";
import {useEffect, useState} from "react";
import EditPersonModal from "../components/modals/editperson";
import {useUiStore} from "@/stores/ui";

export enum Modals {
    'NONE',
    'NEW_PERSON',
    'EDIT_PERSON'
}

export default function Home() {
    const [modal, setModal] = useState<Modals>(Modals.NONE)
    const { editPerson, setEditPerson } = useUiStore((state) => state);

    const familyId = 3;


    useEffect(() => {
        if (editPerson !== undefined) {
            setModal(Modals.EDIT_PERSON);
        } else {
            setModal(Modals.NONE);
        }
    }, [edit
        Person])

    const modalClose = () => {
        setEditPerson(undefined);
        setModal(Modals.NONE);
    }
  return (
      <main>
        <FamilyTree id={familyId}></FamilyTree>
          <div className="absolute bottom-10 left-[50%]">
              <Menu createPerson={() => setModal(Modals.NEW_PERSON)}></Menu>
          </div>
          {
              (modal === Modals.NEW_PERSON || modal === Modals.EDIT_PERSON) && familyId && <EditPersonModal familyId={familyId} person={editPerson} onClose={modalClose}></EditPersonModal>
          }
    </main>
  );
}
