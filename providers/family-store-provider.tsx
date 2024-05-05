'use client'

import {type ReactNode, createContext, useRef, useContext} from 'react'
import {type StoreApi, useStore} from 'zustand'
import {createFamilyStore, type FamilyStore} from "@/stores/family";


export const FamilyStoreContext = createContext<StoreApi<FamilyStore> | null>(
    null,
)


export interface FamilyStoreProviderProps {
    children: ReactNode
}

export const FamilyStoreProvider = ({
                                        children,
                                    }: FamilyStoreProviderProps) => {
    const storeRef = useRef<StoreApi<FamilyStore>>()
    if (!storeRef.current) {
        storeRef.current = createFamilyStore();
    }

    return (
        <FamilyStoreContext.Provider value={storeRef.current}>
            {children}
        </FamilyStoreContext.Provider>
    )
}

export const useFamilyStore = <T, >(
    selector: (store: FamilyStore) => T,
): T => {
    const familyStoreContext = useContext(FamilyStoreContext)

    if (!familyStoreContext) {
        throw new Error(`useFamilyStore must be use within FamilyStoreProvider`)
    }

    return useStore(familyStoreContext, selector)
}