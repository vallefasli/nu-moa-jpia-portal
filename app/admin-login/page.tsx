'use client'

import { login } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'
import { useActionState } from 'react'

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="p-3 bg-[#35408e]/10 rounded-full mb-2">
            <ShieldAlert className="w-8 h-8 text-[#35408e]" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-[#35408e]">System Administrator</CardTitle>
          <CardDescription className="text-center text-gray-500">
            Secure portal sign in for authorized administrators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4 mt-2">
            <input type="hidden" name="login_role" value="admin" />
            
            {state?.error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="admin@national-u.edu.ph" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
              />
            </div>
            <Button 
              className="w-full bg-[#35408e] hover:bg-[#28306e] text-white font-bold transition-all mt-2" 
              type="submit" 
              disabled={isPending}
            >
              {isPending ? 'Authenticating...' : 'Sign In as Administrator'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-gray-100 pt-4">
          <div className="text-xs text-gray-400 text-center w-full">
            Unauthorized access attempts are strictly monitored and logged.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
