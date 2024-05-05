import {Controller, useForm} from "react-hook-form";
import {DateInput, DatePicker, Input, Textarea} from "@nextui-org/react";
import {FormProps} from "@/components/forms/base";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import {useEffect} from "react";
import {Person, PersonBase} from "@/stores/family/family.model";
import moment from "moment/moment";


const schema = yup.object({
    firstname: yup.string().required(),
    lastname: yup.string().required(),
    birthcity: yup.string().required(),
    birthdate: yup.date().required(),
    deathcity: yup.string(),
    deathdate: yup.date(),
    comments: yup.string(),
}).required();


const PersonForm = ({valueChanges}: FormProps) => {

    const { register, control, watch, getValues, formState } = useForm({
       resolver: yupResolver(schema)
    });


    useEffect(() => {
       if (formState.isValid) {
           const values = getValues();
           valueChanges({
               ...values,
               birthdate: moment(values.birthdate).format("YYYY/MM/DD"),
               deathdate: values.deathdate ? moment(values.deathdate).format("YYYY/MM/DD") : null
           } as PersonBase);
       }
    }, [formState.isValid])


    return (
        <>
            <Input label="Voornaam" {...register("firstname", { required: true})} />
            <Input label="Achternaam" {...register("lastname", { required: true})} />
            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm" >Geboorte</h3>
            <div className="flex flex-row gap-4">
                <Controller
                    name="birthdate"
                    control={control}
                    rules={{required: true}}
                    render={({field}) => <DatePicker label="Datum" {...field} />}
                />
                <Input label="Stad" {...register("birthcity", { required: true})} />
            </div>
            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm" >Overlijden</h3>
            <div className="flex flex-row gap-4">
                <Controller
                    name="deathdate"
                    control={control}
                    render={({field}) => <DatePicker label="Datum" {...field} />}
                />
                <Input label="Stad" {...register("deathcity", { required: true})} />
            </div>
            <h3 className="p-2 font-bold text-neutral-500 uppercase text-sm" >Extra</h3>
            <Input label="Extra informatie" {...register("comments")}></Input>
        </>

    )
}

export default PersonForm;