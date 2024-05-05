'use client';

import Image from "next/image";
import FamilyTree from "@/components/familytree";
import Search from "@/components/search";
import Menu from "@/components/menu";
import {useState} from "react";
import AddPersonModal from "@/components/modals/addperson";

export enum Modals {
    'NONE',
    'NEW_PERSON'
}

export default function Home() {
    const [modal, setModal] = useState<Modals>(Modals.NONE)
    const familyId = 3;

    const modalClose = () => {
        setModal(Modals.NONE);
    }
  return (
      <main>
        <FamilyTree id={familyId}></FamilyTree>
          <div className="absolute bottom-10 left-[50%]">
              <Menu createPerson={() => setModal(Modals.NEW_PERSON)}></Menu>
          </div>
          {
              modal === Modals.NEW_PERSON && familyId && <AddPersonModal familyId={familyId} onClose={modalClose}></AddPersonModal>
          }
    </main>
  );
}
