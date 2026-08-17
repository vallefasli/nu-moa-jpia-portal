import BackButton from '@/components/BackButton'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Privacy Policy | NU MOA JPIA',
  description: 'Privacy Policy for the NU MOA JPIA Membership Portal',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <BackButton />
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: August 2026
          </p>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardContent className="p-6 sm:p-10 prose prose-blue max-w-none text-gray-600">
            <p>
              The National University Mall of Asia - Junior Philippine Institute of Accountants (NU MOA JPIA) is committed to protecting your privacy and ensuring that your personal data is handled responsibly and in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173).
            </p>
            
            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">1. Information We Collect</h3>
            <p>
              When you register for the NU MOA JPIA Membership Portal, we collect the following personal information:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Full Name</li>
              <li>Student Number</li>
              <li>University Email Address</li>
              <li>Academic Program and Year Level</li>
              <li>Committee Affiliation (if applicable)</li>
              <li>Event Attendance Records (via QR Code scanning)</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h3>
            <p>
              The information collected is used exclusively for legitimate organizational purposes, including but not limited to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Verifying your identity and membership status.</li>
              <li>Tracking event attendance and calculating participation points.</li>
              <li>Generating personalized electronic certificates for attended events.</li>
              <li>Communicating official announcements, updates, and organizational matters.</li>
              <li>Analyzing general demographic data to improve our events and initiatives.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">3. Data Protection and Security</h3>
            <p>
              We implement strict security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction. Your data is stored securely in our database (powered by Supabase) and is only accessible to authorized Administrators and Officers of NU MOA JPIA who require access to perform their official duties.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">4. Data Sharing and Disclosure</h3>
            <p>
              NU MOA JPIA will <strong>never</strong> sell, rent, or trade your personal information to third parties. We may only disclose your information if required by the university administration or by law.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h3>
            <p>
              As a data subject, you have the right to access, update, or request the deletion of your personal information. If you wish to exercise these rights or have any concerns regarding your data, please contact the NU MOA JPIA Executive Board or the portal administrator.
            </p>

            <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              By creating an account and using this portal, you consent to the collection and processing of your personal data as described in this Privacy Policy.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
