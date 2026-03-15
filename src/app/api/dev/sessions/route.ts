import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const sessions = await prisma.generationSession.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    return Response.json({ error: "Failed to load sessions" }, { status: 500 });
  }
}
