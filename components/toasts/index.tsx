'use client';

import { Toast, ToastType } from "@/stores/toasts/model";
import clsx from "clsx";
import { useEffect, useState } from "react";
import {useToastsStore} from "@/stores/toasts";

const Toasts = () => {
    const [ids, setIds] = useState<string[]>([]);
    const { toasts, removeToast } = useToastsStore((state) => state);

    useEffect(() => {
        const toastsIds = toasts.map((t: Toast) => t.id);

        for (const id of toastsIds) {
            if (!ids.includes(id)) {
                setTimeout(() => {
                    removeToast(id);
                }, 3 * 1000);
            }
        }

        setIds(toastsIds);

    }, [toasts]);


    return <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[90%] md:w-96 z-[60]">
        {
            toasts.map((t: Toast, index: number) => (
                <div key={`toast-${index}`} className={
                    clsx('rounded-lg shadow-md px-5 py-2.5 text-sm transition-opacity ease-in-out mt-2',
                        {
                            'bg-danger text-danger-foreground': t.type === ToastType.ERROR,
                            'bg-success text-success-foreground': t.type === ToastType.SUCCESS,
                        }
                    )
                }>{t.message}</div>
            ))
        }
    </div>
};

export default Toasts;