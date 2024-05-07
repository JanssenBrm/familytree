import {createStore} from 'zustand/vanilla'
import {useContext} from "react";
import {useStore} from "zustand";
import {RootStoreContext} from "@/stores/root-store-provider";
import {Child, Marriage, Person, PersonBase} from "@/stores/family/model";

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
    addPerson: (person: Person) => void,
    updatePerson: (id: number, person: Person) => void,
    deletePerson: (id: number) => void,
    addMarriage: (marriage: Marriage) => void,
    updateMarriage: (id: number, marriage: Marriage) => void,
    deleteMarriage: (id: number) => void,
    addChild: (child: Child) => void,
    deleteChild: (id: number) => void,
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
        addPerson: (person: Person) => set((state) => ({people: [...state.people, person]})),
        updatePerson: (id: number, person: Person) => set((state) => ({
            people: [...state.people].map((p: Person) => p.id === id ? ({
                ...p,
                ...person
            }) : p)
        })),
        deletePerson: (id: number) => set((state) => ({
            people: [...state.people].filter((p: Person) => p.id !== id)})),
        addMarriage: (marriage: Marriage) => set((state) => ({ marriages: [...state.marriages, marriage]})),
        updateMarriage: (id: number, marriage: Marriage) => set((state) => ({
            marriages: [...state.marriages].map((m:Marriage ) => m.id === id ? ({
                ...m,
                ...marriage
            }) : m)
        })),
        deleteMarriage: (id: number) => set((state) => ({ marriages: [...state.marriages].filter(m => m.id !== id)})),
        addChild: (child: Child) => set((state) => ({ children: [...state.children, child]})),
        deleteChild: (id: number) => set((state) => ({ children: [...state.children].filter(c => c.id !== id)}))
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
