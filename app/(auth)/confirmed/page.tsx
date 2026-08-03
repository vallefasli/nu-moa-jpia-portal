import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function ConfirmedPage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center border-t-4 border-t-green-500 shadow-lg">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <div className="flex justify-center bg-green-50 p-4 rounded-full">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#35408e]">Email Verified</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Your email address has been successfully verified. Your account is currently pending admin approval. You will be able to log in once your registration is approved.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Link href="/" className="w-full">
            <Button className="w-full bg-[#35408e] hover:bg-[#28306e] text-base py-6">
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
