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

    const prompts = shop.promptSelections.map((selection) => selection.promptPreset);

    return Response.json({
      shopDomain: shop.shopDomain,
      prompts,
    });
  } catch (error) {
    console.error("Storefront prompts error:", error);
    return Response.json(
      { error: "Failed to load storefront prompts" },
      { status: 500 }
    );
  }
}
