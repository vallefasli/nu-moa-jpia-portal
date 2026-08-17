import { ImageResponse } from 'next/og'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params
    const { searchParams } = new URL(request.url)
    const isPreview = searchParams.get('preview') === 'true'
    const supabase = await createClient()
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    // 1. Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (!userData) return new Response('User not found', { status: 404 })

    // 2. Get event details
    const { data: eventData } = await supabase
      .from('events')
      .select('title, date, auto_certificate_enabled')
      .eq('id', eventId)
      .single()

    if (!eventData) return new Response('Event not found', { status: 404 })

    // 3. Verify access
    if (!isPreview) {
      const { data: feedbackData } = await supabase
        .from('event_feedbacks')
        .select('additional_responses')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()

      if (!feedbackData) return new Response('Feedback not submitted yet', { status: 403 })
      if (!feedbackData.additional_responses?.auto_certificate) {
        return new Response('Auto-certificate not distributed for you', { status: 403 })
      }
    }

    // Format date
    const eventDate = new Date(eventData.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // Create the fully drawn image response
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            position: 'relative',
            fontFamily: 'Inter, sans-serif',
            padding: '40px', // Inner padding for border
          }}
        >
          {/* Inner Decorative Border */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              border: '8px solid #35408e',
              outline: '2px solid #fbb03b',
              outlineOffset: '-16px',
              backgroundColor: '#fafafa',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Top Left Corner Accent */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '150px',
                height: '150px',
                borderRight: '8px solid #fbb03b',
                borderBottom: '8px solid #fbb03b',
                borderBottomRightRadius: '100px',
              }}
            />
            {/* Bottom Right Corner Accent */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '150px',
                height: '150px',
                borderLeft: '8px solid #fbb03b',
                borderTop: '8px solid #fbb03b',
                borderTopLeftRadius: '100px',
              }}
            />

            {/* Header */}
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#fbb03b',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '24px',
              }}
            >
              Certificate of Participation
            </div>

            <div
              style={{
                fontSize: 24,
                color: '#6b7280',
                marginBottom: '48px',
              }}
            >
              This certificate is proudly presented to
            </div>

            {/* Student Name */}
            <div
              style={{
                fontSize: 84,
                fontWeight: 900,
                color: '#111827',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                borderBottom: '4px solid #35408e',
                paddingBottom: '12px',
                marginBottom: '32px',
                minWidth: '60%',
              }}
            >
              {userData.full_name}
            </div>

            {/* Subtext */}
            <div
              style={{
                fontSize: 24,
                color: '#4b5563',
                marginBottom: '24px',
                textAlign: 'center',
              }}
            >
              for their outstanding participation and successful completion of
            </div>

            {/* Event Title */}
            <div
              style={{
                fontSize: 56,
                fontWeight: 800,
                color: '#35408e',
                textAlign: 'center',
                maxWidth: '85%',
                lineHeight: 1.2,
                marginBottom: '24px',
              }}
            >
              {eventData.title}
            </div>

            {/* Date */}
            <div
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Presented on {eventDate}
            </div>

            {/* Footer Logos / Signatures Placeholder */}
            <div
              style={{
                position: 'absolute',
                bottom: '80px',
                display: 'flex',
                width: '80%',
                justifyContent: 'space-between',
                padding: '0 40px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '200px', height: '2px', backgroundColor: '#35408e', marginBottom: '8px' }} />
                <div style={{ fontSize: 18, color: '#4b5563', fontWeight: 600 }}>NU MOA JPIA</div>
                <div style={{ fontSize: 14, color: '#9ca3af' }}>Official Organization</div>
              </div>
            </div>
          </div>
          
          {/* Watermark for preview mode */}
          {isPreview && (
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                zIndex: 10,
              }}
            >
              <div
                style={{
                  fontSize: 140,
                  fontWeight: 900,
                  color: 'rgba(0, 0, 0, 0.15)',
                  transform: 'rotate(-30deg)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                PREVIEW
              </div>
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 848, // A4 Landscape ratio approximation (1.414:1)
      }
    )
  } catch (e: any) {
    console.error('Error generating certificate:', e)
    return new Response(`Failed to generate certificate: ${e.message}`, { status: 500 })
  }
}
