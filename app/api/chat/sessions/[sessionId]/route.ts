// app/api/chat/sessions/[sessionId]/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;

    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: session.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const msgs = chatSession.messages.map(m => ({
      id: m.id,
      sender: m.role === 'user' ? 'user' : 'ai',
      text: m.content,
      timestamp: (m.metadata as any)?.clientTimestamp || m.createdAt,
      ...(m.metadata as any)
    }));

    // Sort in memory using the exact client timestamp
    msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json({
      id: chatSession.id,
      title: chatSession.title,
      messages: msgs,
      lastMessageAt: chatSession.updatedAt,
      major: (session.user as any).major
    });
  } catch (error) {
    console.error("GET_SINGLE_SESSION_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, messages } = await req.json();
    const { sessionId } = await params;

    console.log(`Updating session ${sessionId}`, { title, messageCount: messages?.length });

    // Pastikan session milik user tersebut
    const existing = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId: session.user.id }
    });

    if (!existing) {
      console.log(`Session ${sessionId} not found or unauthorized for user ${session.user.id}`);
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    // Update session
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        title: title || existing.title,
        messages: {
          upsert: messages.map((m: any) => {
            const clientTime = m.timestamp || new Date().toISOString();
            return {
              where: { id: m.id || "new_record" },
              update: {
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text || "", // Fallback to empty string if text is missing
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
              },
              create: {
                id: m.id || undefined,
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text || "", // Fallback to empty string if text is missing
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
              }
            };
          })
        }
      }
    });

    // Invalidate cache
    cache.delete(`sessions:${session.user.id}`);

    return NextResponse.json(updatedSession);
  } catch (error: any) {
    console.error("UPDATE_SESSION_ERROR:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;

    // Delete all messages belonging to this session first to avoid foreign key constraint violations
    await prisma.chatMessage.deleteMany({
      where: { sessionId }
    });

    // Then delete the chat session itself
    await prisma.chatSession.delete({
      where: { 
        id: sessionId,
        userId: session.user.id // Security check
      }
    });

    // Invalidate cache
    cache.delete(`sessions:${session.user.id}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_SESSION_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
