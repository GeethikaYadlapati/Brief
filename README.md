# Brief — Your team's memory, on demand.

> *"Why did we drop the enterprise tier?"*
> *"Who owns the billing system?"*
> *"Why did we pick this tech stack?"*
>
> Every startup has these questions. Most have no good answers.
> Brief fixes that.

**[Live Demo](https://brief-cyan.vercel.app)** · Built by [Geethika Yadlapati](https://github.com/GeethikaYadlapati)

---

## What is Brief?

Brief is an AI-powered onboarding assistant that answers new hire questions using your team's actual documents, decisions, and institutional knowledge.

Upload your docs once. Brief semantically searches them when someone asks a question, generates a grounded answer with citations, and — when it can't answer confidently — flags the gap for the team to fill. Every human answer gets ingested back into the knowledge base automatically, so Brief gets smarter with every question it fails to answer.

**The core insight:** Knowledge bases fail because nobody writes in them. Brief grows from questions, not documentation.

---

## How It Works

```
New hire asks a question
        ↓
Brief embeds the question (OpenAI text-embedding-3-small)
        ↓
pgvector searches for semantically similar chunks
        ↓
Dynamic confidence scoring (absolute ceiling + spread analysis)
        ↓
         ├── Confident? → LLM generates answer with citations
         │                Answer + confidence score saved to DB
         │
         └── Not confident? → Gap flagged for team
                              Admin answers in 2 minutes
                              Answer ingested as Q+A pair
                              Future questions benefit instantly
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 + TypeScript | Full stack in one ecosystem |
| Auth | Clerk | Webhook-based user sync to own DB |
| Database | PostgreSQL (Neon) | Relational data + vector search |
| ORM | Prisma | Type-safe schema and migrations |
| Vector search | pgvector | Embeddings in Postgres, no separate vector DB |
| Embeddings | OpenAI text-embedding-3-small | 1536-dim semantic vectors |
| LLM | GPT-4o-mini | Structured JSON outputs with self-reported confidence |
| Styling | Tailwind CSS + inline styles | Clean, fast UI |
| Deployment | Vercel | Automatic deploys from GitHub |

---

## Architecture Decisions

**Why pgvector instead of Pinecone?**
For this scale, keeping relational data and vector embeddings in the same Postgres database reduces operational complexity. No separate service to manage, no extra billing, tighter integration between document metadata and vector search. Would consider Pinecone at much larger scale.

**Why dynamic confidence threshold instead of fixed?**
A fixed threshold breaks across different document types and question styles. The dynamic approach looks at the spread between best and worst chunk similarity scores — clustered scores mean confident retrieval, spread scores mean uncertain. Combined with an absolute ceiling to catch completely irrelevant queries.

**Why structured LLM outputs for confidence scoring?**
Rather than hardcoding a confidence value or using brittle phrase matching to detect uncertain answers, the LLM self-reports its confidence as part of the structured JSON response. This gives a signal that actually reflects context quality, not just retrieval distance.

**Why Q+A pair embedding for human answers?**
When a human answers a gap, storing just the answer loses the question context. Embedding "Q: What is X? A: X is..." dramatically improves retrieval for future semantically similar questions.

**Why Clerk webhooks instead of just using Clerk's user object?**
Clerk manages authentication. We need our own User and Workspace records in Postgres to attach questions, sources, and gaps to. The webhook syncs Clerk users to our database on signup, including setting the role in Clerk's publicMetadata for fast client-side role checks.

---

## Features

- **Semantic search** over uploaded documents, Slack exports, and manual Q&A entries
- **Confidence scoring** — dynamic threshold + LLM self-reported confidence
- **Gap flagging** — questions Brief can't answer are surfaced to admins
- **Knowledge ingestion loop** — human answers become searchable sources automatically
- **Answer citations** — every answer links back to the source chunks used
- **Role-based access** — admins manage knowledge, new hires ask questions
- **Dashboard** — question volume, answer rate, open gaps, recent activity

---

## Database Schema

9 tables covering the full product loop:

```
Workspace → User → Question → Answer → AnswerCitation → Chunk
                 ↘ Gap → HumanAnswer → Source → Chunk
```

Key design decisions:
- `Gap` is a separate table from `Question` — it represents a specific moment of failure with its own lifecycle (created, resolved, promoted to source)
- `Chunk` uses `Unsupported("vector(1536)")` for pgvector compatibility with Prisma 5
- `HumanAnswer` tracks `promotedSourceId` so you know which answers have been ingested back

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/GeethikaYadlapati/Brief.git
cd Brief

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in: DATABASE_URL, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
# CLERK_SECRET_KEY, WEBHOOK_SECRET, OPENAI_API_KEY

# Run database migrations
npx prisma migrate dev

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## What I'd Build Next

- **Semantic caching** — check if a similar question was already answered before hitting the LLM, reducing cost and latency for repeated questions
- **Staleness detection** — flag answers from sources older than 90 days for team revalidation
- **Invite flow** — let admins invite new hires by email with a proper HIRE role
- **Slack integration** — answer gaps directly from Slack so the 2-minute promise actually meets people where they work
- **Answer feedback** — thumbs up/down to build a dataset for future threshold tuning

---

## What I Learned Building This

This was my first production full stack app with an AI layer. The things that surprised me most:

- **Chunking strategy matters more than model choice** — a better embedding model won't save you if your chunks cut sentences at bad boundaries
- **Confidence scoring is unsolved** — every approach (fixed threshold, dynamic threshold, LLM self-reporting) has failure modes. The right answer is user feedback over time
- **The gap loop is the product** — the RAG pipeline is the plumbing. The feature that makes Brief actually useful is what happens when it fails: capturing the gap, routing it to a human, and learning from the answer

---

*Built with Next.js, pgvector, and OpenAI. RAG pipeline from scratch — no LangChain.*