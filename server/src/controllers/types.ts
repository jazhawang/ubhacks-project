
export interface NodeOutputType {
    id: string;
    subarray: [number];
    merge_index: number;
    children: [NodeOutputType];
}


export interface CompType {
    id: string;
    comparing: [number];
    result?: [number];
}