'use client'
import { useEffect } from "react"
import {userRouter} from "next/navigation"
import {api} from "@/lib/api"

export function useApi() {
    const router = userRouter()
    useEffect(()=>{

        const intereptor = api.intereptors.response.use(
            (r) => r,
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem("gd_token")
                    document.cookie = "gd_token=;path=/;max-age=0"
                    router.push("/login")
                }
                return Promise.reject(error)
            }
        );
        return () =>api.intereptor.response.eject(intereptor)
    },[router])
    return api;
}