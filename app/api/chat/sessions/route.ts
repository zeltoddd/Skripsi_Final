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
    const formattedSessions = chatSessions.map(s => {
      const msgs = s.messages.map(m => ({
        id: m.id,
        sender: m.role === 'user' ? 'user' : 'ai',
        text: m.content,
        timestamp: (m.metadata as any)?.clientTimestamp || m.createdAt,
        ...(m.metadata as any)
      }));

      // Sort in memory using the exact client timestamp
      msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return {
        id: s.id,
        title: s.title,
        messages: msgs,
        lastMessageAt: s.updatedAt,
        major: (session.user as any).major
      };
    });

    // Cache for 5 minutes
    cache.set(cacheKey, formattedSessions, 5 * 60 * 1000);

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
    const { id, title, messages } = await req.json();

    const newSession = await prisma.chatSession.create({
      data: {
        id: id || undefined,
        userId: session.user.id,
        title: title || "Sesi Baru",
        messages: {
          create: messages.map((m: any) => {
            const clientTime = m.timestamp || new Date().toISOString();
            return {
              id: m.id || undefined,
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text || "", // Fallback
              createdAt: new Date(clientTime),
              metadata: {
                clientTimestamp: clientTime,
                reasoning: m.reasoning || null,
                quickActions: m.quickActions || null,
                groundingMetadata: m.groundingMetadata || null,
                imageUrl: m.imageUrl || null,
                imageCaption: m.imageCaption || null,
                fileData: m.fileData || null
              }
            };
          })
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

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete all messages belonging to this user's sessions first to avoid foreign key violations
    await prisma.chatMessage.deleteMany({
      where: {
        session: {
          userId: session.user.id
        }
      }
    });

    await prisma.chatSession.deleteMany({
      where: { userId: session.user.id }
    });

    // Invalidate cache for this user
    cache.delete(`sessions:${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_ALL_SESSIONS_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
