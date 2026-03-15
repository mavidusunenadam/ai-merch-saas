import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return Response.json({ error: "shop is required" }, { status: 400 });
    }

    const existingShop = await prisma.shop.findUnique({
      where: { shopDomain: shop },
    });

    if (existingShop) {
      return Response.redirect(new URL("/dashboard/prompts", req.url));
    }

    const createdShop = await prisma.shop.create({
      data: {
        shopDomain: shop,
        plan: "FREE",
        creditsRemaining: 10,
        isActive: true,
      },
    });

    await prisma.creditLog.create({
      data: {
        shopId: createdShop.id,
        type: "FREE_GRANT",
        amount: 10,
        reason: "Initial free credits on install",
      },
    });

    return Response.redirect(new URL("/dashboard/prompts", req.url));
  } catch (error) {
    console.error("Install route error:", error);
    return Response.json({ error: "Install failed" }, { status: 500 });
  }
}
