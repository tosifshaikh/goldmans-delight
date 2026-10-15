import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import { api } from './api'

export type Role = {
    id:number;
    name:string;
    description:string | null;
    level:number;
    created_at:string;
    updated_at:string;
};

export type RoleCreate = {
    name:string;
    description?:string | null;
    level:number;
}

export type RoleUpdate = Partial<RoleCreate>;

const KEY = ["roles"];

export function useRoles() {
    return useQuery({
        queryKey:KEY,
        queryFn:async () => (await api.get<Role[]>("/roles")).data,
    })
}

export function useCreateRole() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn:async (payload:RoleCreate) => (await api.post<Role>("/roles",payload)).data,
        onSuccess:() => qc.invalidateQueries({queryKey:KEY}),
    });
}

export function useUpdateRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({id,...payload}: RoleUpdate & {id:number}) => 
            (await api.patch<Role>(`/roles/${id}`,payload)).data,
        onSuccess:()=> qc.invalidateQueries({queryKey:KEY}),
    });
}

export function useDeleteRole(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (id:number) => {
            await api.delete(`/roles/${id}`)
        },
        onSuccess:() =>qc.invalidateQueries({queryKey:KEY})
    })
}