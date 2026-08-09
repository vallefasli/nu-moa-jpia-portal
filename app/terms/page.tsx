import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#35408e] hover:underline mb-6 inline-block">
          &larr; Back to Portal
        </Link>
        <Card className="shadow-lg border-t-4 border-t-[#35408e]">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#35408e]">Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-gray-600 space-y-4">
            <p><strong>Last Updated:</strong> August 2026</p>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-6">1. Acceptance of Terms</h3>
            <p>
              By accessing and using the National University Mall of Asia - Junior Philippine Institute of Accountants (NU MOA JPIA) Portal, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">2. Description of Service</h3>
            <p>
              The NU MOA JPIA Portal provides students, members, and officers with tools to track event attendance, manage certificates, and access organizational announcements. We reserve the right to modify or discontinue any aspect of the portal at any time.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">3. User Accounts and Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must provide accurate, current, and complete information during the registration process (including your exact Student Number and Program).</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials (e.g., your Google account access).</li>
              <li>You agree not to use the portal for any illegal or unauthorized purpose, including attempting to forge event attendance or generate fraudulent certificates.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">4. Event Attendance and Certificates</h3>
            <p>
              Event attendance is tracked electronically. Certificates generated through this portal are official documents of the NU MOA JPIA. Any attempt to alter, forge, or falsely claim certificates will be subject to disciplinary action by the organization's executive board and the university.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">5. Termination</h3>
            <p>
              We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">6. Contact Information</h3>
            <p>
              If you have any questions about these Terms, please contact the NU MOA JPIA Executive Board or your respective committee officers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
