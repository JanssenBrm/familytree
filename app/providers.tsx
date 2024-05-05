'use client'

import {NextUIProvider} from '@nextui-org/react'
import {RootStoreProvider} from "@/stores/root-store-provider";
import {I18nProvider} from "@react-aria/i18n";

export function Providers({children}: { children: React.ReactNode }) {
    return (
        <NextUIProvider>
            <I18nProvider locale="nl-be">
                <RootStoreProvider>
                    {children}
                </RootStoreProvider>
            </I18nProvider>
        </NextUIProvider>
    )
}