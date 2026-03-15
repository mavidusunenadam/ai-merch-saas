import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await prisma.generationSession.findUnique({
      where: { id: sessionId },
      include: {
        shop: true,
      },
    });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    let productTemplate = null;

    if (session.shop.selectedProductTemplateId) {
      productTemplate = await prisma.productTemplate.findUnique({
        where: {
          id: session.shop.selectedProductTemplateId,
        },
      });
    }

    return Response.json({
      success: true,
      session,
      productTemplate,
    });
  } catch (error) {
    console.error("Final session error:", error);
    return Response.json(
      { error: "Failed to load final session" },
      { status: 500 }
    );
  }
}
