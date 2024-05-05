import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure} from "@nextui-org/modal";
import {Button} from "@nextui-org/react";
import {ModalProps} from "@/components/modals/base";
import PersonForm from "@/components/forms/person";
import {useEffect, useState} from "react";
import {Person} from "@/stores/family/family.model";

const AddPersonModal = ({onClose}: ModalProps) => {
    const [personFormValue, setPersonFormValue] = useState<Person | undefined>();

    return (
        <Modal isOpen={true} onClose={onClose} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Nieuw familielid toevoegen</ModalHeader>
                        <ModalBody className="flex flex-col overflow-auto">
                          <PersonForm  valueChanges={setPersonFormValue}></PersonForm>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Sluiten
                            </Button>
                            <Button color="primary" onPress={onClose} isDisabled={!personFormValue}>
                                Toevoegen
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
};

export default AddPersonModal