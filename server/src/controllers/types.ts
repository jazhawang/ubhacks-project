
export interface NodeOutputType {
    id: string;
    subarray: number[];
    merge_index: number;
    children: NodeOutputType[];  
    team_name?: string;  
}

export interface CompType {
    id: string; // id of the comp type
    comparing: number[];
    swap?: boolean;
    team_name?: string;
}
