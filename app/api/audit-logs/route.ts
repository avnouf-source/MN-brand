import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuditLogs, logAuditEvent } from '@/lib/audit'

// GET /api/audit-logs: Super Admin restricted
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const isSuperAdmin =
    session?.user &&
    ((session.user as any).role === 'ADMIN' ||
      (session.user as any).email === 'admin@bperfume.com')

  if (!isSuperAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Super Admin access required' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') || '100', 10)
  const logs = await getAuditLogs(limit)

  return NextResponse.json({ logs })
}

// POST /api/audit-logs: Log an action
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  const body = await req.json()

  const agentId = body.agentId || (session?.user as any)?.id || 'agent-system'
  const agentName = body.agentName || (session?.user as any)?.name || 'System Agent'

  const entry = await logAuditEvent({
    agentId,
    agentName,
    action: body.action || 'Unknown Action',
    target: body.target || 'General CRM',
    severity: body.severity || 'INFO',
    details: body.details,
    ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1',
  })

  return NextResponse.json({ success: true, log: entry })
}
