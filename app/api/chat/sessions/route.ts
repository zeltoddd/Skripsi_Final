// app/api/chat/sessions/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cacheKey = `sessions:${session.user.id}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const chatSessions = await prisma.chatSession.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Map ke format yang diharapkan UI
    const formattedSessions = chatSessions.map(s => ({
      id: s.id,
      title: s.title,
      messages: s.messages.map(m => ({
        id: m.id,
        sender: m.role === 'user' ? 'user' : 'ai',
        text: m.content,
        timestamp: m.createdAt,
        ...(m.metadata as any)
      })),
      lastMessageAt: s.updatedAt,
      major: (session.user as any).major
    }));

    // Cache for 5 minutes
    cache.set(cacheKey, formattedSessions);

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error("GET_SESSIONS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, messages } = await req.json();

    const newSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        title: title || "Sesi Baru",
        messages: {
          create: messages.map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text || "", // Fallback
            metadata: {
              reasoning: m.reasoning || null,
              quickActions: m.quickActions || null,
              groundingMetadata: m.groundingMetadata || null,
              imageUrl: m.imageUrl || null,
              imageCaption: m.imageCaption || null,
              fileData: m.fileData || null
            }
          }))
        }
      },
      include: {
        messages: true
      }
    });

    // Invalidate cache for this user
    cache.delete(`sessions:${session.user.id}`);

    return NextResponse.json(newSession);
  } catch (error) {
    console.error("CREATE_SESSION_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
