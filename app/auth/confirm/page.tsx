'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { confirmEmailToken } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { MailCheck, Loader2, AlertCircle } from 'lucide-react'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/confirmed'

  const hasParams = Boolean(code || (token_hash && type))

  async function handleConfirm() {
    setIsPending(true)
    setError(null)

    try {
      const res = await confirmEmailToken({ code, token_hash, type })
      if (res?.error) {
        setError(res.error)
      } else if (res?.success) {
        router.push(next)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-t-4 border-t-[#35408e] shadow-lg">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#35408e]/10">
          <MailCheck className="h-8 w-8 text-[#35408e]" />
        </div>
        <CardTitle className="text-2xl font-bold text-[#35408e]">
          Confirm Your Email
        </CardTitle>
        <CardDescription className="text-base text-gray-600">
          Click the button below to verify your email address and complete your account registration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {error && (
          <div className="flex items-start space-x-2 rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Verification Failed</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!hasParams && !error && (
          <div className="flex items-start space-x-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p>Verification code or token is missing from the link. Please check your email link and try again.</p>
          </div>
        )}

        <Button
          onClick={handleConfirm}
          disabled={!hasParams || isPending}
          className="w-full bg-[#35408e] py-6 text-base font-semibold hover:bg-[#28306e] transition-colors"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Verifying Email...
            </>
          ) : (
            'Verify Email Address'
          )}
        </Button>

        <div className="pt-2 text-center text-sm text-gray-500">
          Need help?{' '}
          <Link href="/" className="font-medium text-[#fbb03b] hover:underline">
            Return to Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#35408e]" />
          <p className="mt-4 text-sm text-gray-600">Loading verification page...</p>
        </Card>
      }>
        <ConfirmEmailContent />
      </Suspense>
    </div>
  )
}
