import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { chunkText } from '@/lib/chunker'
import { embedText } from '@/lib/embedder'


export async function POST(req: Request) {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const clerkId = userId

  const { title, content, type } = await req.json()

  if (!title || !content || !type) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const source = await prisma.source.create({
    data: {
      title,
      rawContent: content,
      type,
      workspaceId: user.workspaceId
    }
  })

  const chunks = chunkText(content)

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i])

    await prisma.$executeRaw`
      INSERT INTO "Chunk" (id, content, embedding, "chunkIndex", "sourceId", "createdAt")
      VALUES (
        ${crypto.randomUUID()},
        ${chunks[i]},
        ${JSON.stringify(embedding)}::vector,
        ${i},
        ${source.id},
        NOW()
      )
    `
  }

  return NextResponse.json({ source })
}
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
  
    const sources = await prisma.source.findMany({
      where: { workspaceId: user.workspaceId },
      include: { chunks: true },
      orderBy: { createdAt: 'desc' }
    })
  
    return NextResponse.json({ sources })
  }