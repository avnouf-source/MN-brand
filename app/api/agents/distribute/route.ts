import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createDistributionJob,
  getJob,
  getLatestJob,
  processSingleBatchStep,
} from '@/lib/distribution-queue'

export const dynamic = 'force-dynamic'

// GET /api/agents/distribute?jobId=...
// Fast polling endpoint for real-time progress tracking
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'SUB_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')

  if (jobId) {
    const job = getJob(jobId)
    if (!job) {
      return NextResponse.json({ error: 'Job not found', jobId }, { status: 404 })
    }

    const progressPercentage =
      job.totalLeads > 0 ? Math.min(100, Math.round((job.processedLeads / job.totalLeads) * 100)) : 100

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      totalLeads: job.totalLeads,
      processedLeads: job.processedLeads,
      batchSize: job.batchSize,
      totalBatches: job.totalBatches,
      completedBatches: job.completedBatches,
      currentBatch: job.currentBatch,
      progressPercentage,
      leadsPerAgent: job.leadsPerAgent,
      activeAgentsCount: job.activeAgentsCount,
      agentAllocations: job.agentAllocations,
      message: job.message,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      completedAt: job.completedAt,
    })
  }

  // Return latest job if no ID passed
  const latestJob = getLatestJob()
  if (latestJob) {
    return NextResponse.json({
      success: true,
      latestJob,
    })
  }

  return NextResponse.json({
    status: 'IDLE',
    message: 'No active distribution jobs. Post to /api/agents/distribute to start 20,000 lead distribution.',
  })
}

// POST /api/agents/distribute
// Triggers asynchronous round-robin chunked lead distribution without timing out
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || (role !== 'ADMIN' && role !== 'SUB_ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    let body: any = {}
    try {
      body = await req.json()
    } catch {}

    const totalLeads = Number(body.totalLeads) || 20000
    const batchSize = Number(body.batchSize) || 500

    // 1. Client-driven Step Chunk execution mode (optional manual stepping)
    if (body.stepChunk && typeof body.batchIndex === 'number') {
      const jobId = body.jobId || `dist-step-${Date.now()}`
      const stepJob = await processSingleBatchStep(jobId, body.batchIndex, batchSize)
      return NextResponse.json({
        success: true,
        mode: 'stepChunk',
        jobId: stepJob.id,
        status: stepJob.status,
        batchIndex: body.batchIndex,
        completedBatches: stepJob.completedBatches,
        totalBatches: stepJob.totalBatches,
        processedLeads: stepJob.processedLeads,
        totalLeads: stepJob.totalLeads,
        message: stepJob.message,
      })
    }

    // 2. Asynchronous Background Queue Mode (Default for 20,000 leads)
    // Instantly returns 200/202 to avoid Vercel 504 FUNCTION_INVOCATION_TIMEOUT
    const job = await createDistributionJob({
      totalLeads,
      batchSize,
      requestedBy: (session.user as any)?.name || 'Admin',
    })

    return NextResponse.json(
      {
        success: true,
        status: 'PROCESSING',
        jobId: job.id,
        totalLeads: job.totalLeads,
        batchSize: job.batchSize,
        totalBatches: job.totalBatches,
        processedLeads: 0,
        progressPercentage: 0,
        leadsPerAgent: job.leadsPerAgent,
        activeAgentsCount: job.activeAgentsCount,
        message: `Round-robin distribution of ${job.totalLeads.toLocaleString()} leads queued in ${job.totalBatches} batches (${job.batchSize} leads/batch). Vercel timeout prevented.`,
        pollUrl: `/api/agents/distribute?jobId=${job.id}`,
      },
      { status: 202 }
    )
  } catch (error: any) {
    console.error('[Distribute API Error]:', error)
    return NextResponse.json(
      {
        error: 'Failed to initiate lead distribution',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
