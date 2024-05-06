import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/modal";
import {Button, DatePicker, Input, Spinner} from "@nextui-org/react";
import {ModalProps} from "@/components/modals/base";
import {useState} from "react";
import {createPerson, deletePerson, updatePerson} from "@/lib/family";
import {ToastType} from "@/stores/toasts/model";
import {useToastsStore} from "@/stores/toasts";
import {Person, PersonBase} from "@/stores/family/model";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {parseDate} from "@internationalized/date";
import moment from "moment";
import * as yup from "yup";
import {useFamilyStore} from "@/stores/family";

interface EditPersonModalProps extends ModalProps {
    person?: Person,
}

const schema = yup.object({
    firstname: yup.string().required(),
    lastname: yup.string().required(),
    birthcity: yup.string().required(),
    birthdate: yup.mixed().required(),
    deathcity: yup.string(),
    deathdate: yup.mixed(),
    comments: yup.string(),
}).required();

const EditPersonModal = ({onClose, familyId, person}: EditPersonModalProps) => {
    const [personFormValue, setPersonFormValue] = useState<PersonBase | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const {addToast} = useToastsStore((state) => state);
    const {addPerson: storeAddPerson, updatePerson: storeUpdatePerson, deletePerson: storeDeletePerson} = useFamilyStore((state) => state);

    const {register, control, watch, getValues, formState} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            firstname: person?.firstname,
            lastname: person?.lastname,
            birthcity: person?.birthcity,
            birthdate: person?.birthdate ? parseDate(moment(person.birthdate).format('YYYY-MM-DD')) : undefined,
            deathcity: person?.deathcity,
            deathdate: person?.deathdate ? parseDate(moment(person.deathdate).format('YYYY-MM-DD')) : undefined,
            comments: person?.comments
        }
    });

    const addPerson = async (family: number, data: PersonBase) => {
        try {
            const newPerson: Person = await createPerson(family, data);
            storeAddPerson(newPerson);
            onClose();
        } catch (error: any) {
            console.error(`Could not add person`, error);
            addToast({
                message: 'Sorry! Kan de persoon niet toevoegen',
                type: ToastType.ERROR
            });
        }
    }

    const editPerson = async (family: number, id: number, data: PersonBase) => {
        try {
            const updatedPerson: Person = await updatePerson(family, id, data)
            storeUpdatePerson(id, updatedPerson);
            onClose();
        } catch (error: any) {
            console.error(`Could not edit person`, error);
            addToast({
                message: 'Sorry! Kan persoon niet aanpassen',
                type: ToastType.ERROR
            });
        }
    }

    const removePerson = async () => {
        try {
            setLoading(true);
            if (familyId && person?.id) {
                await deletePerson(familyId, person.id)
                storeDeletePerson(person.id);
                onClose();
            }
        } catch (error: any) {
            console.error(`Could not delete person`, error);
            addToast({
                message: 'Sorry! Kan persoon niet verwijderen',
                type: ToastType.ERROR
            });
        }
        setLoading(false);
    }


    const submitPerson = async () => {
        if (formState.isValid && familyId) {
            const values = getValues();
            const formValue: PersonBase = {
                ...values,
                // @ts-ignore
                birthdate: moment(values.birthdate.toDate()).format("YYYY/MM/DD"),
                // @ts-ignore
                deathdate: values.deathdate ? moment(values.deathdate.toDate()).format("YYYY/MM/DD") : undefined
            }
            setLoading(true)
            if (person && person.id) {
                await editPerson(familyId, person.id, formValue);
            } else {
                await addPerson(familyId, formValue);
            }
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={true} onClose={onClose} backdrop="blur">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {person ? `Familielid ${person?.firstname} ${person?.lastname} bewerken` : 'Nieuw familielid toevoegen'}
                        </ModalHeader>
                        <ModalBody className="flex flex-col overflow-auto">
                            <Input label="Voornaam" {...register("firstname", {required: true})} />
                            <Input label="Achternaam" {...register("lastname", {required: true})} />
                            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm">Geboorte</h3>
                            <div className="flex flex-row gap-4">
                                <Controller
                                    name="birthdate"
                                    control={control}
                                    rules={{required: true}}
                                    render={({field}) => <DatePicker label="Datum" {...field} />}
                                />
                                <Input label="Stad" {...register("birthcity", {required: true})} />
                            </div>
                            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm">Overlijden</h3>
                            <div className="flex flex-row gap-4">
                                <Controller
                                    name="deathdate"
                                    control={control}
                                    render={({field}) => <DatePicker label="Datum" {...field} />}
                                />
                                <Input label="Stad" {...register("deathcity", {required: true})} />
                            </div>
                            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm">Extra</h3>
                            <Input label="Extra informatie" {...register("comments")}></Input>
                        </ModalBody>
                        <ModalFooter className="flex justify-between items-center">
                            <div>
                                {
                                    person?.id && <Button color="danger" isDisabled={loading} onPress={removePerson}>
                                        Verwijderen
                                    </Button>
                                }

                            </div>
                            <div className="flex gap-2">
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Sluiten
                                </Button>
                                <Button color="primary" isDisabled={!formState.isValid || loading}
                                        onPress={submitPerson}>
                                    {loading ? <Spinner/> : <span> {person ? 'Aanpassen' : 'Toevoegen'}</span>}
                                </Button>

                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
};

export default EditPersonModal