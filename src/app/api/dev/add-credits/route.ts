import { PrismaClient } from "@prisma/client";
import { getDevShopDomainFromRequest } from "@/lib/dev-shop";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const shopDomain = getDevShopDomainFromRequest(req);

    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
    });

    if (!shop) {
      const allShops = await prisma.shop.findMany({
        select: {
          id: true,
          shopDomain: true,
          creditsRemaining: true,
        },
      });

      return Response.json(
        {
          error: "Shop not found",
          expectedShopDomain: shopDomain,
          existingShops: allShops,
        },
        { status: 404 }
      );
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        creditsRemaining: {
          increment: 50,
        },
      },
    });

    return Response.json({
      success: true,
      message: "50 credits added",
      shopDomain: updatedShop.shopDomain,
      creditsRemaining: updatedShop.creditsRemaining,
    });
  } catch (error) {
    console.error("Add credits error:", error);
    return Response.json(
      { error: "Failed to add credits" },
      { status: 500 }
    );
  }
}
