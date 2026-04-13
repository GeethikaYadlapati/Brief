import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { embedText } from '@/lib/embedder'
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

  const gaps = await prisma.gap.findMany({
    where: {
      resolvedAt: null,
      question: {
        workspaceId: user.workspaceId
      }
    },
    include: {
      question: {
        include: {
          askedBy: true
        }
      },
      humanAnswer: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ gaps })
}

export async function POST(req: Request) {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const clerkId = userId
  const { gapId, content } = await req.json()

  const user = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const gap = await prisma.gap.findUnique({
    where: { id: gapId },
    include: { question: true }
  })

  if (!gap) {
    return NextResponse.json({ error: 'Gap not found' }, { status: 404 })
  }

  // Save human answer
  await prisma.humanAnswer.create({
    data: {
      content,
      gapId,
      answeredById: user.id
    }
  })

  // Update gap as resolved
  await prisma.gap.update({
    where: { id: gapId },
    data: { resolvedAt: new Date() }
  })

  // Update question status
  await prisma.question.update({
    where: { id: gap.questionId },
    data: { status: 'RESOLVED' }
  })

  // Ingest answer back as a new source so future questions benefit
  const source = await prisma.source.create({
    data: {
      title: `Q: ${gap.question.content}`,
      rawContent: `Q: ${gap.question.content}\nA: ${content}`,
      type: 'MANUAL_QA',
      workspaceId: user.workspaceId
    }
  })

  const embedding = await embedText(content)

  await prisma.$executeRaw`
    INSERT INTO "Chunk" (id, content, embedding, "chunkIndex", "sourceId", "createdAt")
    VALUES (
      ${crypto.randomUUID()},
      ${content},
      ${JSON.stringify(embedding)}::vector,
      ${0},
      ${source.id},
      NOW()
    )
  `

  // Update promoted source on human answer
  await prisma.humanAnswer.updateMany({
    where: { gapId },
    data: { promotedSourceId: source.id }
  })

  return NextResponse.json({ success: true })
}