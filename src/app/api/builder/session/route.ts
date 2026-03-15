import { PrismaClient } from "@prisma/client";
import { getDevShopDomainFromRequest } from "@/lib/dev-shop";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const shopDomain = getDevShopDomainFromRequest(req);
    const body = await req.json();
    const { selectedPromptId, originalFileName, sourceImageUrl, mode } = body;

    if (!sourceImageUrl) {
      return Response.json(
        { error: "Source image is required" },
        { status: 400 }
      );
    }

    if (mode !== "generate" && mode !== "original") {
      return Response.json({ error: "Invalid mode" }, { status: 400 });
    }

    if (mode === "generate" && !selectedPromptId) {
      return Response.json(
        { error: "Selected prompt is required for generate mode" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
    });

    if (!shop) {
      return Response.json(
        { error: `Shop not found for domain: ${shopDomain}` },
        { status: 404 }
      );
    }

    if (mode === "generate" && shop.creditsRemaining < 1) {
      return Response.json(
        {
          error: "Not enough credits. Please upgrade your plan or buy more credits.",
        },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.generationSession.create({
        data: {
          shopId: shop.id,
          selectedPromptId: mode === "generate" ? selectedPromptId : null,
          originalFileName: originalFileName || null,
          sourceImageUrl,
          status: mode === "generate" ? "queued" : "original_selected",
        },
      });

      let updatedCredits = shop.creditsRemaining;

      if (mode === "generate") {
        const updatedShop = await tx.shop.update({
          where: { id: shop.id },
          data: {
            creditsRemaining: {
              decrement: 1,
            },
          },
        });

        updatedCredits = updatedShop.creditsRemaining;

        await tx.creditLog.create({
          data: {
            shopId: shop.id,
            type: "IMAGE_GENERATION",
            amount: -1,
            reason: `1 credit used for generation session ${session.id}`,
          },
        });
      }

      return {
        session,
        updatedCredits,
      };
    });

    return Response.json({
      success: true,
      session: result.session,
      creditsRemaining: result.updatedCredits,
      chargedCredits: mode === "generate" ? 1 : 0,
      shopDomain,
    });
  } catch (error) {
    console.error("Create session error:", error);
    return Response.json(
      { error: "Failed to create builder session" },
      { status: 500 }
    );
  }
}
