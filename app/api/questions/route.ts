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

  const questions = await prisma.question.findMany({
    where: { askedById: user.id },
    include: {
      answer: {
        include: {
          citations: {
            include: {
              chunk: {
                include: {
                  source: true
                }
              }
            }
          }
        }
      },
      gap: {
        include: {
          humanAnswer: {
            include: {
              answeredBy: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ questions })
}