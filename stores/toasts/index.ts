'use client';

import {create, useStore} from 'zustand';
import {Toast, ToastBase} from './model';
import {v4 as uuidv4} from 'uuid';
import {FamilyState, FamilyStore} from "@/stores/family";
import {useContext} from "react";
import {RootStoreContext} from "@/stores/root-store-provider";

export type ToastState = {
    toasts: Toast[],
}

export type ToastActions = {
    addToast: (toast: ToastBase) => void,
    removeToast: (id: string) => void,
}

export type ToastStore = ToastState & ToastActions
export const defaultInitState: ToastState = {
    toasts: []
}

export const createToastStore = (
    initState: ToastState = defaultInitState,
) => {
    return create<ToastStore>((set) => ({
        toasts: [],
        addToast: (toast: ToastBase) => set((state) => ({
            toasts: [...state.toasts, {
                id: uuidv4(),
                ...toast
            }]
        })),
        removeToast: (id: string) => set((state) => ({toasts: state.toasts.filter((t: Toast) => t.id !== id)})),
    }))
};
export const useToastsStore = <T, >(
    selector: (store: ToastStore) => T,
): T => {
    const toastStoreContext = useContext(RootStoreContext)?.toasts

    if (!toastStoreContext) {
        throw new Error(`useToastsStore must be use within RootStoreProvider`)
    }

    return useStore(toastStoreContext, selector)
}
