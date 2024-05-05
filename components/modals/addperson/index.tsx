import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/modal";
import {Button, Spinner} from "@nextui-org/react";
import {ModalProps} from "@/components/modals/base";
import PersonForm from "@/components/forms/person";
import {useState} from "react";
import {createPerson} from "@/lib/family";
import {ToastType} from "@/stores/toasts/model";
import {useToastsStore} from "@/stores/toasts";
import {PersonBase} from "@/stores/family/model";

const AddPersonModal = ({onClose, familyId}: ModalProps) => {
    const [personFormValue, setPersonFormValue] = useState<PersonBase | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const { addToast } = useToastsStore((state) => state);

    const addPerson = () => {
        if (personFormValue && familyId) {
            setLoading(true)
            createPerson(familyId, personFormValue)
                .then(() => {
                    setLoading(false);
                    onClose();
                }).catch((error) => {
                    console.error('Could not create person', error);
                    addToast({
                        message: 'Kon de persoon niet toevoegen',
                        type: ToastType.ERROR
                    });
                    setLoading(false);
            })
        }
    }

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
                            <Button color="primary"  isDisabled={!personFormValue || loading} onPress={addPerson}>
                                {loading ? <Spinner/> : <span>Toevoegen</span>}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
};

export default AddPersonModal