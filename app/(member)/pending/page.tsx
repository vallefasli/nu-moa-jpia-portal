import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/(auth)/actions'

export default function PendingVerificationPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-t-4 border-t-[#fbb03b]">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-amber-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[#fbb03b]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#35408e]">Verification in Progress</CardTitle>
          <CardDescription className="text-base">
            Your account is currently under review by our administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-600 flex flex-col items-center">
          <p className="mb-4">
            We need to verify your student information before granting you access to the member dashboard and digital ID.
          </p>
          <p className="text-sm mb-6">
            Please check back later or contact an officer if you believe this is taking too long.
          </p>
          
          <form action={logout}>
            <Button variant="outline" type="submit">
              Log Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
