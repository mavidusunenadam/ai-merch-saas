import { PrismaClient } from "@prisma/client";
import { getDevShopDomainFromRequest } from "@/lib/dev-shop";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const shopDomain = getDevShopDomainFromRequest(req);

    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
      select: {
        id: true,
        shopDomain: true,
        plan: true,
        creditsRemaining: true,
      },
    });

    if (!shop) {
      return Response.json({ error: "Shop not found" }, { status: 404 });
    }

    return Response.json(shop);
  } catch (error) {
    console.error("Get dev shop error:", error);
    return Response.json({ error: "Failed to load shop" }, { status: 500 });
  }
}
