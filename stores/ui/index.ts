'use client';

import {create, useStore} from 'zustand';
import {Toast, ToastBase} from './model';
import {v4 as uuidv4} from 'uuid';
import {FamilyState, FamilyStore} from "@/stores/family";
import {useContext} from "react";
import {RootStoreContext} from "@/stores/root-store-provider";
import {Person} from "@/stores/family/model";
import {ToastStore} from "@/stores/toasts";

export type UiState = {
    editPerson: Person | undefined,
}

export type UiActions = {
    setEditPerson: (person: Person | undefined) => void,
}

export type UiStore = UiState & UiActions
export const defaultInitState: UiState = {
    editPerson: undefined
}

export const createUiStore = (
    initState: UiState = defaultInitState,
) => {
    return create<UiStore>((set) => ({
       editPerson: undefined,
        setEditPerson: (person: Person | undefined) => set((state) => ({ editPerson: person}))
    }))
};
export const useUiStore = <T, >(
    selector: (store: UiStore) => T,
): T => {
    const uiStoreContext = useContext(RootStoreContext)?.ui

    if (!uiStoreContext) {
        throw new Error(`useUiStore must be use within RootStoreProvider`)
    }

    return useStore(uiStoreContext, selector)
}
