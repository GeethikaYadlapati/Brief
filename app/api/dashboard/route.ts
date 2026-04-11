import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clerkId = userId

  const user = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const [
    totalQuestions,
    answeredQuestions,
    flaggedQuestions,
    totalSources,
    totalGaps,
    resolvedGaps,
    recentQuestions
  ] = await Promise.all([
    prisma.question.count({
      where: { workspaceId: user.workspaceId }
    }),
    prisma.question.count({
      where: { workspaceId: user.workspaceId, status: 'ANSWERED' }
    }),
    prisma.question.count({
      where: { workspaceId: user.workspaceId, status: 'FLAGGED' }
    }),
    prisma.source.count({
      where: { workspaceId: user.workspaceId }
    }),
    prisma.gap.count({
      where: { question: { workspaceId: user.workspaceId } }
    }),
    prisma.gap.count({
      where: {
        question: { workspaceId: user.workspaceId },
        resolvedAt: { not: null }
      }
    }),
    prisma.question.findMany({
      where: { workspaceId: user.workspaceId },
      include: { answer: true, gap: { include: { humanAnswer: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  const activity = recentQuestions.map(q => {
    if (q.status === 'ANSWERED') {
      return {
        id: q.id,
        type: 'answered',
        text: `"${q.content.substring(0, 60)}${q.content.length > 60 ? '...' : ''}" — answered by Brief`,
        createdAt: q.createdAt,
        dotColor: '#1D9E75'
      }
    } else if (q.status === 'FLAGGED') {
      return {
        id: q.id,
        type: 'flagged',
        text: `Gap flagged: "${q.content.substring(0, 60)}${q.content.length > 60 ? '...' : ''}" — awaiting team response`,
        createdAt: q.createdAt,
        dotColor: '#EF9F27'
      }
    } else {
      return {
        id: q.id,
        type: 'resolved',
        text: `Gap resolved: "${q.content.substring(0, 60)}${q.content.length > 60 ? '...' : ''}" — saved to Brief`,
        createdAt: q.createdAt,
        dotColor: '#7F77DD'
      }
    }
  })

  return NextResponse.json({
    stats: {
      totalQuestions,
      answeredQuestions,
      flaggedQuestions,
      totalSources,
      totalGaps,
      resolvedGaps
    },
    activity
  })
}