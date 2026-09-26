import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// ElevenLabs Female Voice Profiles
// 'Rachel' (Calm, Professional Female) id: 21m00Tcm4TlvDq8ikWAM
// 'Bella' (Warm, Elegant Luxury Voice) id: EXAVITQu4vr4xnSDxMaL
const DEFAULT_FEMALE_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const isSuperAdmin =
      session?.user &&
      ((session.user as any).role === 'ADMIN' ||
        (session.user as any).email === 'admin@bperfume.com')

    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 })
    }

    const { text, voiceId = DEFAULT_FEMALE_VOICE_ID } = await req.json()
    if (!text) {
      return NextResponse.json({ error: 'Text is required for TTS synthesis' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY

    // Clean text of markdown characters before voice synthesis
    const cleanText = text
      .replace(/[#*`_~\[\]]/g, '')
      .replace(/\n+/g, '. ')
      .trim()
      .slice(0, 1000)

    if (apiKey && apiKey !== 'demo_dummy_key') {
      try {
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': apiKey,
            },
            body: JSON.stringify({
              text: cleanText,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.8,
                style: 0.2,
                use_speaker_boost: true,
              },
            }),
          }
        )

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer()
          return new NextResponse(audioBuffer, {
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'no-cache',
            },
          })
        }
      } catch (err) {
        console.warn('[ElevenLabs API error, falling back to Web Speech]:', err)
      }
    }

    // Return indicator for browser Web Speech synthesis fallback
    return NextResponse.json({
      fallbackToWebSpeech: true,
      cleanText,
      voice: 'female',
      note: 'Using high-fidelity browser female voice synthesis (ElevenLabs API Key can be configured in Vercel)',
    })
  } catch (error: any) {
    console.error('[TTS Route Error]:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
