import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-[#35408e] hover:underline mb-6 inline-block">
          &larr; Back to Portal
        </Link>
        <Card className="shadow-lg border-t-4 border-t-[#35408e]">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-[#35408e]">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-gray-600 space-y-4">
            <p><strong>Last Updated:</strong> August 2026</p>
            
            <p>
              The National University Mall of Asia - Junior Philippine Institute of Accountants (NU MOA JPIA) respects your privacy and is committed to protecting the personal data of our members.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">1. Information We Collect</h3>
            <p>
              When you register for an account using Google Auth and complete your profile, we collect your:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Full Name (First, Middle, and Last)</li>
              <li>Email Address</li>
              <li>Student Number</li>
              <li>Program and Year Level</li>
              <li>Committee Affiliation</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">2. How We Use Your Information</h3>
            <p>
              Your personal information is securely stored and used strictly for organizational purposes, which include:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Generating official certificates of participation/attendance.</li>
              <li>Tracking event attendance via QR codes.</li>
              <li>Verifying your identity as a legitimate student and member of NU MOA JPIA.</li>
              <li>Communicating organizational updates and announcements.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">3. Data Security</h3>
            <p>
              We implement appropriate security measures designed to protect your personal data from accidental loss, unauthorized access, use, alteration, and disclosure. All authentication is handled securely via trusted identity providers (Google).
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">4. Data Sharing</h3>
            <p>
              We do not sell, trade, or rent your personal information to third parties. Your data is accessible only to authorized NU MOA JPIA Executive Board members and system administrators for official use.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">5. Your Rights</h3>
            <p>
              You have the right to request access to, correction of, or deletion of your personal data stored in our portal. For such requests, please reach out to the NU MOA JPIA administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
