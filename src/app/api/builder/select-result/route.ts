import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, selectedResultId, finalImageUrl } = body;

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (!selectedResultId) {
      return Response.json({ error: "selectedResultId is required" }, { status: 400 });
    }

    if (!finalImageUrl) {
      return Response.json({ error: "finalImageUrl is required" }, { status: 400 });
    }

    const session = await prisma.generationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const updatedSession = await prisma.generationSession.update({
      where: { id: sessionId },
      data: {
        selectedResultId,
        finalImageUrl,
        status: "result_selected",
      },
    });

    return Response.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error("Select result error:", error);
    return Response.json(
      { error: "Failed to save selected result" },
      { status: 500 }
    );
  }
}
