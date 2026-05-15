// app/api/chat/sessions/[sessionId]/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cache } from "@/lib/cache";

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
          deleteMany: {},
          create: messages.map((m: any) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text || "", // Fallback to empty string if text is missing
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
