import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/(auth)/actions'
import { LogoutDialog } from '@/components/LogoutDialog'
import { PendingPoller } from './PendingPoller'

export default function PendingVerificationPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <PendingPoller />
      <Card className="w-full max-w-md border-t-4 border-t-[#fbb03b]">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-amber-100 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[#fbb03b]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#35408e]">Account Under Review</CardTitle>
          <CardDescription className="text-base">
            What happens next?
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-gray-600 flex flex-col items-center">
          <p className="mb-4 text-left w-full">
            <strong>Officer Approval:</strong> Your email is verified, but an administrator must review your student details before you can access the dashboard. 
          </p>
          <p className="mb-6 text-left w-full">
            You will be able to log in normally once your account is activated by an officer.
          </p>
          
          <LogoutDialog>
            <Button variant="outline">
              Log Out
            </Button>
          </LogoutDialog>
        </CardContent>
      </Card>
    </div>
  )
}
