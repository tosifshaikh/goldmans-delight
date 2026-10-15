import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export type Role_level = {
    id:number;
    key:string;
    description:string | null;
    label:string;
    rank:number;
    created_at:string;
    updated_at:string;
};

const KEY = ["role_levels"];
export function useRoleLevel() {
    return useQuery({
        queryKey:KEY,
        queryFn:async () => (await api.get<Role_level[]>("/role_levels")).data,
    })
}