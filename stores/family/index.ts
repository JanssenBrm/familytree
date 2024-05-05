import {createStore} from 'zustand/vanilla'
import {useContext} from "react";
import {useStore} from "zustand";
import {RootStoreContext} from "@/stores/root-store-provider";
import {Child, Marriage, Person} from "@/stores/family/model";

export type FamilyState = {
    people: Person[],
    marriages: Marriage[],
    children: Child[],
}

export type FamilyActions = {
    setPeople: (people: Person[]) => void
    setMarriages: (marriage: Marriage[]) => void
    setChildren: (children: Child[]) => void
    initFamily: (people: Person[], marriages: Marriage[], children: Child[]) => void
}

export type FamilyStore = FamilyState & FamilyActions;

export const defaultInitState: FamilyState = {
    people: [],
    marriages: [],
    children: []
}

export const createFamilyStore = (
    initState: FamilyState = defaultInitState,
) => {
    return createStore<FamilyStore>()((set) => ({
        ...initState,
        initFamily: (people: Person[], marriages: Marriage[], children: Child[]) => set((state) => ({people, marriages, children})),
        setPeople: (people: Person[]) => set((state) => ({people})),
        setMarriages: (marriages: Marriage[]) => set((state) => ({marriages})),
        setChildren: (children: Child[]) => set((state) => ({children})),
    }))
}

export const useFamilyStore = <T, >(
    selector: (store: FamilyStore) => T,
): T => {
    const familyStoreContext = useContext(RootStoreContext)?.family

    if (!familyStoreContext) {
        throw new Error(`useFamilyStore must be use within RootStoreProvider`)
    }

    return useStore(familyStoreContext, selector)
}
