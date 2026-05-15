import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates: any = {};
    const body = await req.json();

    // Allowed fields
    if (body.name !== undefined) updates.name = body.name;
    if (body.grade !== undefined) updates.grade = body.grade;
    if (body.major !== undefined) updates.major = body.major;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        major: true,
        grade: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("UPDATE_USER_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
