import { PrismaClient } from "@prisma/client";
import { getDevShopDomainFromRequest } from "@/lib/dev-shop";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const shopDomain = getDevShopDomainFromRequest(req);

    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
      include: {
        promptSelections: {
          include: {
            promptPreset: true,
          },
        },
      },
    });

    if (!shop) {
      return Response.json({ error: "Shop not found" }, { status: 404 });
    }

    return Response.json({
      shopId: shop.id,
      selectedPromptIds: shop.promptSelections.map(
        (selection) => selection.promptPresetId
      ),
      selectedPrompts: shop.promptSelections.map(
        (selection) => selection.promptPreset
      ),
    });
  } catch (error) {
    console.error("GET shop prompts error:", error);
    return Response.json(
      { error: "Failed to load shop prompt selections" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const shopDomain = getDevShopDomainFromRequest(req);
    const body = await req.json();
    const promptIds = body.promptIds as string[];

    if (!Array.isArray(promptIds)) {
      return Response.json({ error: "promptIds must be an array" }, { status: 400 });
    }

    if (promptIds.length > 4) {
      return Response.json(
        { error: "You can select up to 4 prompts only" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
    });

    if (!shop) {
      return Response.json({ error: "Shop not found" }, { status: 404 });
    }

    await prisma.shopPromptSelection.deleteMany({
      where: { shopId: shop.id },
    });

    if (promptIds.length > 0) {
      await prisma.shopPromptSelection.createMany({
        data: promptIds.map((promptId) => ({
          shopId: shop.id,
          promptPresetId: promptId,
        })),
      });
    }

    const updatedSelections = await prisma.shopPromptSelection.findMany({
      where: { shopId: shop.id },
      include: { promptPreset: true },
    });

    return Response.json({
      success: true,
      selectedPromptIds: updatedSelections.map((item) => item.promptPresetId),
      selectedPrompts: updatedSelections.map((item) => item.promptPreset),
    });
  } catch (error) {
    console.error("POST shop prompts error:", error);
    return Response.json(
      { error: "Failed to save prompt selections" },
      { status: 500 }
    );
  }
}
