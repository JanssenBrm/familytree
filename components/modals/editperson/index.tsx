import {Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@nextui-org/modal";
import {Autocomplete, AutocompleteItem, Button, CalendarDate, DatePicker, Input, Spinner} from "@nextui-org/react";
import {ModalProps} from "@/components/modals/base";
import {useState} from "react";
import {
    createChild,
    createMarriage,
    createPerson,
    deleteChild,
    deleteMarriage,
    deletePerson,
    updateMarriage,
    updatePerson
} from "@/lib/family";
import {ToastType} from "@/stores/toasts/model";
import {useToastsStore} from "@/stores/toasts";
import {Child, Marriage, Person, PersonBase} from "@/stores/family/model";
import {Controller, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {parseDate} from "@internationalized/date";
import moment from "moment";
import * as yup from "yup";
import {useFamilyStore} from "@/stores/family";

interface EditPersonModalProps extends ModalProps {
    person?: Person,
    marriages: Marriage[],
    members: Person[],
    children: Child[],
}

// const personSchema = yup.object({
//     firstname: yup.string().required(),
//     lastname: yup.string().required(),
//     birthcity: yup.string().required(),
//     birthdate: yup.mixed().required(),
//     deathcity: yup.string(),
//     deathdate: yup.mixed(),
//     comments: yup.string(),
// });
//
// const marriageSchema = yup.object({
//     partner: yup.number(),
//     city: yup.string(),
//     date: yup.mixed(),
// });
//
// const parentsSchema = yup.object({
//     marriage: yup.number(),
// })
//
// const schema = yup.object({
//     person: personSchema,
//     marriage: marriageSchema,
//     parents: parentsSchema,
// });

const EditPersonModal = ({onClose, familyId, person, marriages, members, children}: EditPersonModalProps) => {
    const [personFormValue, setPersonFormValue] = useState<PersonBase | undefined>();
    const [loading, setLoading] = useState<boolean>(false);
    const {addToast} = useToastsStore((state) => state);
    const {
        addPerson: storeAddPerson,
        updatePerson: storeUpdatePerson,
        deletePerson: storeDeletePerson,
        addMarriage: storeAddMarriage,
        updateMarriage: storeUpdateMarriage,
        deleteMarriage: storeDeleteMarriage,
        addChild: storeAddChild,
        deleteChild: storeDeleteChild,
    } = useFamilyStore((state) => state);
    const getPerson = (id: number): Person | undefined => members.find((p: Person) => p.id === id);

    const marriageLabels = marriages.map((m: Marriage) => {
        const p1 = m.p1 ? getPerson(m.p1) : undefined;
        const p2 = m.p2 ? getPerson(m.p2) : undefined;
        return {
            id: m.id,
            label: `${p1?.firstname} ${p1?.lastname} - ${p2?.firstname} ${p2?.lastname}`
        }

    });

    const getMarriage = (id?: number): Marriage | undefined => marriages.find((m: Marriage) => m.p1 === id || m.p2 === id)

    const getMarriageData = (person?: Person) => {
        if (person) {
            const marriage: Marriage | undefined = getMarriage(person?.id);
            if (marriage) {
                return {
                    partner: marriage.p1 === person.id ? marriage.p2 : marriage.p1,
                    date: marriage.date ? parseDate(moment(marriage.date).format('YYYY-MM-DD')) : undefined,
                    city: marriage.city
                }
            }
        }
        return {
            partner: undefined,
            date: undefined,
            city: undefined,
        }

    }

    const getChild = (id?: number): Child | undefined => children.find((c: Child) => c.childid === id);
    const getParentsData = (person?: Person) => {
        if (person) {
            const child: Child | undefined = getChild(person?.id);
            if (child) {
                return {
                    marriage: child.marriageid,
                }
            }
        }
        return {
            marriage: undefined,
        }
    }

    const {register, control, watch, getValues, formState} = useForm({
        defaultValues: {
            person: {
                firstname: person?.firstname,
                lastname: person?.lastname,
                birthcity: person?.birthcity,
                birthdate: person?.birthdate ? parseDate(moment(person.birthdate.length === 4 ? `${person.birthdate}/01/01` : person.birthdate).format('YYYY-MM-DD')) : undefined,
                deathcity: person?.deathcity,
                deathdate: person?.deathdate ? parseDate(moment(person.deathdate.length === 4 ? `${person.deathdate}/01/01` : person.deathdate).format('YYYY-MM-DD')) : undefined,
                comments: person?.comments
            },
            marriage: getMarriageData(person),
            parents: getParentsData(person)
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

                const child = getChild(person?.id);
                if (child && child.id) {
                    await deleteChild(familyId, child.id);
                    storeDeleteChild(child.id);
                }

                const marriage = getMarriage(person?.id);
                if (marriage && marriage.id) {
                    await deleteMarriage(familyId, marriage.id);
                    storeDeleteMarriage(marriage.id);
                }

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
            // @ts-ignore
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
            // @ts-ignore
            const marriageDate = date ? moment(date.toDate()).format("YYYY/MM/DD") : undefined;
            const existingMarriage = getMarriage(person?.id);
            if (existingMarriage && existingMarriage.id && (existingMarriage.p1 === partner || existingMarriage.p2 === partner) && (existingMarriage.date === marriageDate) && existingMarriage.city === city) {
                console.warn("Skipping marriage as it is the same as the existing one")
            } else if (existingMarriage && existingMarriage.id && (existingMarriage.p1 === partner || existingMarriage.p2 === partner)) {
                const updatedMarriage: Marriage = await updateMarriage(familyId, existingMarriage.id, {
                    ...existingMarriage,
                    city,
                    date: marriageDate
                })
                storeUpdateMarriage(existingMarriage.id, updatedMarriage);

            } else {
                if (existingMarriage && existingMarriage.id) {
                    await deleteMarriage(familyId, existingMarriage.id);
                    storeDeleteMarriage(existingMarriage.id);
                }
                if (partner && partner > 0) {
                    const marriage = await createMarriage(familyId, {
                        p1: person.id || 0,
                        p2: partner,
                        city,
                        date: marriageDate,
                    });
                    storeAddMarriage(marriage);
                }
            }

        }
    }
    const submitParents = async (person: Person) => {
        if (formState.isValid && familyId) {
            const {marriage} = getValues().parents;
            const existingChild = getChild(person?.id);
            if (existingChild && existingChild.id) {
                await deleteChild(familyId, existingChild.id);
                storeDeleteChild(existingChild.id);
            }
            if (marriage && marriage > 0) {
                const child = await createChild(familyId, {
                    childid: person.id || 0,
                    marriageid: marriage,
                });
                storeAddChild(child);
            }

        }
    }

    const submitForm = async () => {
        const person = await submitPerson();
        if (person) {
            await submitMarriage(person);
            await submitParents(person);
        }
    }

    console.log(formState, getValues());

    return (
        <Modal isOpen={true} onClose={onClose} backdrop="blur">
            <ModalContent className="md:max-h-[75vh] max-h-[95vh]">
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
                                <Input label="Stad" {...register("person.deathcity")} />
                            </div>
                            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm">Huwelijk</h3>

                            <Controller render={({field}) =>
                                // @ts-ignore
                                <Autocomplete {...field} label="Getrouwd met" placeholder="Selecteer persoon"
                                              onSelectionChange={(key: any) => field.onChange(+key)}
                                              selectedKey={`${field.value}`}
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
                            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm">Ouders</h3>
                            <Controller render={({field}) =>
                                // @ts-ignore
                                <Autocomplete {...field} label="Kind van" placeholder="Selecteer huwelijk"
                                              onSelectionChange={(key: any) => field.onChange(+key)}
                                              selectedKey={`${field.value}`}
                                >
                                    {marriageLabels.map((m) => (
                                        <AutocompleteItem key={m.id || 0} value={m.id || 0}>
                                            {m.label}
                                        </AutocompleteItem>
                                    ))}
                                </Autocomplete>

                            } name={"parents.marriage"} control={control}/>
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
                                    {loading ? <Spinner size="sm" color="white"/> :
                                        <span> {person ? 'Aanpassen' : 'Toevoegen'}</span>}
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