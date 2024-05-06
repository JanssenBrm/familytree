import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/modal";
import {Autocomplete, AutocompleteItem, Button, DatePicker, Input, Spinner} from "@nextui-org/react";
import {ModalProps} from "@/components/modals/base";
import {useState} from "react";
import {createMarriage, createPerson, deletePerson, updatePerson} from "@/lib/family";
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
    members: Person[],
}

const personSchema = yup.object({
    firstname: yup.string().required(),
    lastname: yup.string().required(),
    birthcity: yup.string().required(),
    birthdate: yup.mixed().required(),
    deathcity: yup.string(),
    deathdate: yup.mixed(),
    comments: yup.string(),
});

const marriageSchema = yup.object({
    partner: yup.number(),
    city: yup.string(),
    date: yup.mixed(),
})

const schema = yup.object({
    person: personSchema,
    marriage: marriageSchema,
})

const EditPersonModal = ({onClose, familyId, person, members}: EditPersonModalProps) => {
    const [personFormValue, setPersonFormValue] = useState<PersonBase | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const {addToast} = useToastsStore((state) => state);
    const {addPerson: storeAddPerson, updatePerson: storeUpdatePerson, deletePerson: storeDeletePerson} = useFamilyStore((state) => state);

    const {register, control, watch, getValues, formState} = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            person: {
                firstname: person?.firstname,
                lastname: person?.lastname,
                birthcity: person?.birthcity,
                birthdate: person?.birthdate ? parseDate(moment(person.birthdate).format('YYYY-MM-DD')) : undefined,
                deathcity: person?.deathcity,
                deathdate: person?.deathdate ? parseDate(moment(person.deathdate).format('YYYY-MM-DD')) : undefined,
                comments: person?.comments
            },
            marriage: {
                partner: undefined,
                date: undefined,
            }
        }
    });

    const watchMarriagePartner = watch('marriage.partner');

    const addPerson = async (family: number, data: PersonBase): Promise<Person | null> => {
        try {
            const newPerson: Person = await createPerson(family, data);
            storeAddPerson(newPerson);
            onClose();
            return newPerson;
        } catch (error: any) {
            console.error(`Could not add person`, error);
            addToast({
                message: 'Sorry! Kan de persoon niet toevoegen',
                type: ToastType.ERROR
            });
            return null;
        }
    }

    const editPerson = async (family: number, id: number, data: PersonBase): Promise<Person | null> => {
        try {
            const updatedPerson: Person = await updatePerson(family, id, data)
            storeUpdatePerson(id, updatedPerson);
            onClose();
            return updatedPerson
        } catch (error: any) {
            console.error(`Could not edit person`, error);
            addToast({
                message: 'Sorry! Kan persoon niet aanpassen',
                type: ToastType.ERROR
            });
            return null;
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


    const submitPerson = async (): Promise<Person | null> => {
        let result = null;
        if (formState.isValid && familyId) {
            const values = getValues().person;
            const formValue: PersonBase = {
                ...values,
                // @ts-ignore
                birthdate: moment(values.birthdate.toDate()).format("YYYY/MM/DD"),
                // @ts-ignore
                deathdate: values.deathdate ? moment(values.deathdate.toDate()).format("YYYY/MM/DD") : undefined
            }
            setLoading(true)
            if (person && person.id) {
                result = await editPerson(familyId, person.id, formValue);
            } else {
                result = await addPerson(familyId, formValue);
            }
            setLoading(false);
        }
        return result;
    }

    const submitMarriage = async (person: Person) => {
        if (formState.isValid && familyId) {
            const {partner, city, date} = getValues().marriage;
            if (partner && partner > 0) {
                await createMarriage(familyId, {
                    p1: person.id,
                    p2: partner,
                    city,
                    date: date ? moment(date.toDate()).format("YYYY/MM/DD") : undefined
                });
            }
        }
    }

    const submitForm = async () => {
        const person = await submitPerson();
        if (person) {
            await submitMarriage(person);
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
                            <Input label="Voornaam" {...register("person.firstname", {required: true})} />
                            <Input label="Achternaam" {...register("person.lastname", {required: true})} />
                            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm">Geboorte</h3>
                            <div className="flex flex-row gap-4">
                                <Controller
                                    name="person.birthdate"
                                    control={control}
                                    rules={{required: true}}
                                    render={({field}) => <DatePicker label="Datum" {...field} />}
                                />
                                <Input label="Stad" {...register("person.birthcity", {required: true})} />
                            </div>
                            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm">Overlijden</h3>
                            <div className="flex flex-row gap-4">
                                <Controller
                                    name="person.deathdate"
                                    control={control}
                                    render={({field}) => <DatePicker label="Datum" {...field} />}
                                />
                                <Input label="Stad" {...register("person.deathcity", {required: true})} />
                            </div>
                            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm">Huwelijk</h3>

                            <Controller render={({field}) =>
                                // @ts-ignore
                                <Autocomplete {...field} label="Getrouwd met" placeholder="Selecteer persoon"
                                              onSelectionChange={(key: any) => field.onChange(+key)}
                                >
                                    {members.map(m => ({
                                        ...m,
                                        label: `${m.firstname} ${m.lastname}`
                                    })).map((m) => (
                                        <AutocompleteItem key={m.id || 0} value={m.id || 0}>
                                            {m.label}
                                        </AutocompleteItem>
                                    ))}
                                </Autocomplete>

                            } name={"marriage.partner"} control={control}/>
                            {
                                !!watchMarriagePartner &&
                                <div className="flex flex-row gap-4">
                                    <Controller
                                        name="marriage.date"
                                        control={control}
                                        render={({field}) => <DatePicker label="Datum" {...field} />}
                                    />
                                    <Input label="Stad" {...register("marriage.city")} />
                                </div>
                            }
                            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm"> Extra</h3>
                            <Input label="Extra informatie" {...register("person.comments")}></Input>
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
                                        onPress={submitForm}>
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