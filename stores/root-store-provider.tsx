'use client'

import {createContext, type ReactNode, useRef} from 'react'
import {type StoreApi} from 'zustand'
import {createFamilyStore, type FamilyStore} from "@/stores/family";
import {createToastStore, ToastStore} from "@/stores/toasts";
import {createUiStore, UiStore} from "@/stores/ui";


export const RootStoreContext = createContext<{
    family: StoreApi<FamilyStore>,
    toasts: StoreApi<ToastStore>,
    ui: StoreApi<UiStore>
} | null>(
    null,
)


export interface RootStoreProviderProps {
    children: ReactNode
}


export const RootStoreProvider = ({
                                      children,
                                  }: RootStoreProviderProps) => {
    const familyStoreRef = useRef<StoreApi<FamilyStore>>()
    if (!familyStoreRef.current) {
        familyStoreRef.current = createFamilyStore();
    }

    const toastStoreRef = useRef<StoreApi<ToastStore>>()
    if (!toastStoreRef.current) {
        toastStoreRef.current = createToastStore();
    }

    const uiStoreRef = useRef<StoreApi<UiStore>>()
    if (!uiStoreRef.current) {
        uiStoreRef.current = createUiStore();
    }

    return (
        <RootStoreContext.Provider
            value={{family: familyStoreRef.current, toasts: toastStoreRef.current, ui: uiStoreRef.current}}>
            {children}
        </RootStoreContext.Provider>
    )
}
