import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { embedText } from '@/lib/embedder'
import OpenAI from 'openai'
import { auth } from '@clerk/nextjs/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const clerkId = userId

  const { question } = await req.json()

  if (!question) {
    return NextResponse.json({ error: 'Missing question' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const questionEmbedding = await embedText(question)

  const similarChunks = await prisma.$queryRaw`
  SELECT id, content, "sourceId",
    embedding <-> ${JSON.stringify(questionEmbedding)}::vector as distance
  FROM "Chunk"
  WHERE "sourceId" IN (
    SELECT id FROM "Source" WHERE "workspaceId" = ${user.workspaceId}
  )
  ORDER BY embedding <-> ${JSON.stringify(questionEmbedding)}::vector
  LIMIT 5
`

const chunks = similarChunks as { id: string; content: string; sourceId: string; distance: number }[]

console.log('Chunks with distances:', chunks.map(c => ({ 
    distance: c.distance, 
    content: c.content.substring(0, 50) 
  })))
  
const bestDistance = chunks[0]?.distance ?? 999
const worstDistance = chunks[chunks.length - 1]?.distance ?? 999
const spread = worstDistance - bestDistance

// If even the best match is too far, flag regardless
const ABSOLUTE_CEILING = 1.3

if (bestDistance > ABSOLUTE_CEILING) {
  const savedQuestion = await prisma.question.create({
    data: {
      content: question,
      status: 'FLAGGED',
      workspaceId: user.workspaceId,
      askedById: user.id
    }
  })

  await prisma.gap.create({
    data: { questionId: savedQuestion.id }
  })

  return NextResponse.json({ 
    answer: null,
    flagged: true,
    message: 'No relevant context found'
  })
}

const CONFIDENCE_THRESHOLD = spread < 0.1
  ? bestDistance + 0.15
  : bestDistance + 0.05

const relevantChunks = chunks.filter(chunk => chunk.distance < CONFIDENCE_THRESHOLD)

  const context = relevantChunks
    .map((chunk, i) => `Source ${i + 1}: ${chunk.content}`)
    .join('\n\n')

  const prompt = `You are a helpful onboarding assistant for a startup team.
  
Answer the following question using ONLY the context provided below. 
If the answer is not in the context, say "I don't have enough information to answer this confidently."

Context:
${context}

Question: ${question}

Answer:`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })

  const answer = completion.choices[0].message.content

  const savedQuestion = await prisma.question.create({
    data: {
      content: question,
      status: 'ANSWERED',
      workspaceId: user.workspaceId,
      askedById: user.id
    }
  })

  const savedAnswer = await prisma.answer.create({
    data: {
      content: answer || '',
      confidenceScore: 0.8,
      questionId: savedQuestion.id
    }
  })
  
  // Save citations
  for (const chunk of relevantChunks) {
    await prisma.answerCitation.create({
      data: {
        answerId: savedAnswer.id,
        chunkId: chunk.id
      }
    })
  }

  return NextResponse.json({
    answer,
    flagged: false,
    sources: relevantChunks.map(c => c.sourceId)
  })
}