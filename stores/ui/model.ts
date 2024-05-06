export enum ToastType {
    INFO,
    WARNING,
    ERROR,
    SUCCESS
}


export interface ToastBase {
    message: string;
    type: ToastType;
    persist?: boolean;
}

export interface Toast extends ToastBase {
    id: string;
}