import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { use } from "react";

export type User = {
    id:number;
    email:string;
    full_name:string;
    role_level_id:number;
    is_active:boolean;
    created_at:string;
    updated_at:string;
};

export type UserCreate = {
    email:string;
    full_name:string;
    role_level_id:number;
    is_active?:boolean;
      must_change_password: boolean;
created_at: string;
  updated_at: string;

      generated_password?: string | null;

};

export type UserUpdate = Partial<{
    email:string;
    full_name:string;
    role_level_id:number;
    is_active:boolean;
}>;

const KEY = ["users"]

export function useUsers() {
    return useQuery({
        queryKey:KEY,
        queryFn:async () => (await api.get<User[]>("/users")).data
    });
}

export function useCreateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn:async (payload:UserCreate) => 
            (await api.post<User>("/users",payload)).data,
        onSuccess:() => qc.invalidateQueries({queryKey:KEY}),
    })
}

export function useUpdateUser() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn:async ({id,...payload}:UserUpdate & {id:number}) => (await api.patch<User>(`/users/${id}`,payload)).data,
        onSuccess:() => qc.invalidateQueries({queryKey:KEY}),
    })
}

export function useDeleteUser() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn:async(id:number) => {
            await api.delete(`/users/${id}`)
        },
        onSuccess:() => qc.invalidateQueries({queryKey:KEY}),
    })
}