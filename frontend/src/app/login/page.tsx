"use client"

import React, { Suspense,useState } from "react"
import { useRouter,useSearchParams } from "next/navigation" 
import { api } from "@/lib/api"
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card,CardContent,CardDescription,CardHeader,CardTitle } from "@/components/ui/card"


export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm()
{
    const router = useRouter()
    const params = useSearchParams()
    const from = params.get('from') || "/dashboard"

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error,setError] = useState<string | null >(null)

    async function onSubmit(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try{
            const {data} = await api.post("/auth/login",{
              email: email.trim().toLowerCase(),
              password})
            setToken(data.access_token)
            router.replace(from)
            router.refresh()
        } catch(err:any){
            setError(err?.response?.data?.detail || "Invalid email or password")
        }
        finally {
            setLoading(false)
        }
    }
    return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Goldman&apos;s Delight</CardTitle>
          <CardDescription>Sign in to the admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e:React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e:React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}