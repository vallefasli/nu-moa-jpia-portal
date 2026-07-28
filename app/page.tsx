'use client'

import { login } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useActionState } from 'react'

function LoginForm({ role }: { role: string }) {
  const [state, formAction, isPending] = useActionState(login, null)
  
  return (
    <form action={formAction} className="space-y-4 mt-4">
      <input type="hidden" name="login_role" value={role} />
      
      {state?.error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`email-${role}`}>Email</Label>
        <Input id={`email-${role}`} name="email" type="email" placeholder="student@national-u.edu.ph" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`password-${role}`}>Password</Label>
        <Input id={`password-${role}`} name="password" type="password" required />
      </div>
      <Button className="w-full bg-[#35408e] hover:bg-[#28306e]" type="submit" disabled={isPending}>
        {isPending ? 'Signing In...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[#35408e]">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Select your role to sign in to the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="member" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="member">Member</TabsTrigger>
              <TabsTrigger value="officer">Officer</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="member">
              <LoginForm role="member" />
            </TabsContent>
            <TabsContent value="officer">
              <LoginForm role="officer" />
            </TabsContent>
            <TabsContent value="admin">
              <LoginForm role="admin" />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-gray-500 text-center w-full">
            Don't have an account?{' '}
            <Link href="/register" className="text-[#fbb03b] font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
