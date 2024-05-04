import {Marriage, Person} from "@/lib/family/family.model";



export interface Node {
    id: string,
    type: string,
    targetPosition?: string,
    sourcePosition?: string,
    position?: {
        x: number,
        y: number,
    },
    data: Person | Marriage
}

export interface Edge {
    id: string,
    source: string,
    target: string,
}