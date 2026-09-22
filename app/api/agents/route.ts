import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const agents = await prisma.user.findMany({ where: { role: 'AGENT' }, select: { id: true, name: true, email: true, department: true, status: true, _count: { select: { assignedLeads: true } } } })
  return NextResponse.json(agents)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { name, email, password, department } = await req.json()
  if (!name || !email || !password) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  const hash = await bcrypt.hash(password, 10)
  const agent = await prisma.user.create({ data: { name, email, passwordHash: hash, role: 'AGENT', department: department || 'General' } })
  return NextResponse.json(agent)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, name, email, department, password } = await req.json()
  const data: any = {}
  if (name) data.name = name
  if (email) data.email = email
  if (department) data.department = department
  if (password) data.passwordHash = await bcrypt.hash(password, 10)
  const agent = await prisma.user.update({ where: { id }, data })
  return NextResponse.json(agent)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id, password } = await req.json()
  const hash = await bcrypt.hash(password, 10)
  await prisma.user.update({ where: { id }, data: { passwordHash: hash } })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await req.json()
  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
