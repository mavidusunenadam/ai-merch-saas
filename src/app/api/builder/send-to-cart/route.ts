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

    if (!session.cartPayloadJson) {
      return Response.json(
        { error: "Cart payload is not prepared yet" },
        { status: 400 }
      );
    }

    const parsedPayload = JSON.parse(session.cartPayloadJson);

    await prisma.generationSession.update({
      where: { id: session.id },
      data: {
        status: "sent_to_cart",
      },
    });

    return Response.json({
      success: true,
      message: "Cart payload is ready to be sent to Shopify.",
      redirectUrl: parsedPayload.ajaxCartUrl || null,
      cartPayload: parsedPayload.ajaxCartPayload || null,
      storefrontCartLine: parsedPayload.storefrontCartLine || null,
    });
  } catch (error) {
    console.error("Send to cart error:", error);
    return Response.json(
      { error: "Failed to send to cart" },
      { status: 500 }
    );
  }
}
