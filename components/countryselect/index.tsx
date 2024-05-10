import {ChangeEventHandler, useEffect, useState} from "react";
import {useToastsStore} from "@/stores/toasts";
import {ToastType} from "@/stores/toasts/model";
import {Autocomplete, AutocompleteItem, Avatar, Select, SelectItem, Spinner} from "@nextui-org/react";
import Image from "next/image";
import {Key} from "@react-types/shared";

interface Country {
    name: string;
    code: string;
    flag: string;
}

interface CountrySelectProps {
    value: string | undefined;
    onChange: (key: Key | null) => void;
}

const CountrySelect = ({value, onChange}: CountrySelectProps) => {
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const {addToast} = useToastsStore((state) => state);

    useEffect(() => {

        async function fetchCountries() {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all');
                const data = await response.json();
                const formattedCountries = data.map((country: any) => ({
                    name: country.name.common,
                    code: country.cca2,
                    flag: country.flags.svg,
                })).sort((c1: Country, c2: Country) => c1.name.localeCompare(c2.name) ? 1 : -1);
                const sortedCountries = formattedCountries.sort((a: Country, b: Country) => a.name.localeCompare(b.name));
                setCountries(sortedCountries);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        }

        if (countries.length === 0) {
            setLoading(true);
            fetchCountries()
                .then(() => setLoading(false))
                .catch((error: any) => {
                    console.error('Could not load in countries', error);
                    addToast({
                        message: `Sorry! Kon de landen niet inladen`,
                        type: ToastType.ERROR
                    });
                    setLoading(false);
                });
        }
    }, [addToast]);

    console.log(value);
    return loading ? (<Spinner size={"md"}/>) : (
        <Autocomplete
            value={value}
            onSelectionChange={onChange}
            label={'Land'}
            selectedKey={value}
            placeholder="Selecteer land"
        >
            {
                countries.map((country) => ({
                    label: country.name,
                    value: country.code,
                    flag: country.flag
                })).map((country) => (
                    <AutocompleteItem key={country.value} value={country.value}
                                startContent={<Avatar alt={country.label} className="w-6 h-6" src={country.flag} />}
                    >
                        {country.label}
                    </AutocompleteItem>
                ))
            }

        </Autocomplete>
    );
}

export default CountrySelect;