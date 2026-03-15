import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await prisma.generationSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    const mockResults = [
      {
        id: `${sessionId}-1`,
        label: "Variation 1",
        imageUrl: session.sourceImageUrl,
      },
      {
        id: `${sessionId}-2`,
        label: "Variation 2",
        imageUrl: session.sourceImageUrl,
      },
      {
        id: `${sessionId}-3`,
        label: "Variation 3",
        imageUrl: session.sourceImageUrl,
      },
      {
        id: `${sessionId}-4`,
        label: "Variation 4",
        imageUrl: session.sourceImageUrl,
      },
    ];

    await prisma.generationSession.update({
      where: { id: sessionId },
      data: {
        status: "generated",
      },
    });

    return Response.json({
      success: true,
      sessionId,
      results: mockResults,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return Response.json(
      { error: "Failed to generate mock results" },
      { status: 500 }
    );
  }
}
