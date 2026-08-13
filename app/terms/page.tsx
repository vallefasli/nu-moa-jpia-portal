import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Terms and Conditions | NU MOA JPIA',
  description: 'Terms and Conditions for the NU MOA JPIA Membership Portal',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-[#35408e] hover:underline mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: August 2026
          </p>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6 sm:p-10 prose prose-blue max-w-none text-gray-600">
            <p>
              Welcome to the National University Mall of Asia - Junior Philippine Institute of Accountants (NU MOA JPIA) Membership Portal. By creating an account and using this platform, you agree to comply with and be bound by the following terms and conditions of use.
            </p>
            
            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Account Registration and Accuracy</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You must use your official National University email address to register.</li>
              <li>You agree to provide accurate, current, and complete information (including your Student Number and Program).</li>
              <li>Creating accounts under false identities or using another student&apos;s information is strictly prohibited and will result in immediate account termination.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. QR Code Usage and Attendance Integrity</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Your unique QR code is for your personal use only.</li>
              <li><strong>Prohibited Actions:</strong> Sharing, screenshotting, or distributing your QR code for another student to scan on your behalf (proxy attendance) is considered academic/organizational dishonesty.</li>
              <li>Any member caught manipulating attendance records or submitting fraudulent scans will face disciplinary action as determined by the Executive Board.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">3. Portal Usage and Conduct</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>You agree to use the portal only for its intended purpose: tracking organizational events, submitting feedback, and downloading certificates.</li>
              <li>Any attempt to hack, exploit, or disrupt the portal&apos;s services will result in a permanent ban and possible reporting to university authorities.</li>
              <li>Feedback submitted for events must be respectful and constructive. Profanity or harassment in feedback forms will not be tolerated.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">4. Certificates and Points</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Certificates of Attendance and points are automatically generated based on verifiable attendance records (Time In and Time Out).</li>
              <li>The organization reserves the right to withhold certificates or deduct points if attendance records are found to be fraudulent.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">5. Modifications</h3>
            <p>
              NU MOA JPIA reserves the right to modify these Terms and Conditions at any time. Significant changes will be communicated to members via official channels or email. Continued use of the portal after such changes constitutes your acceptance of the new Terms.
            </p>

            <div className="mt-10 p-4 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-800">
              If you have any questions about these Terms, please contact the Executive Board.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
