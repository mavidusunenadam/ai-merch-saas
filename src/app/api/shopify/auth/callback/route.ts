import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");
    const code = searchParams.get("code");

    if (!shop || !code) {
      return Response.json(
        { error: "shop and code are required" },
        { status: 400 }
      );
    }

    // Şimdilik token exchange yerine wiring testi yapıyoruz.
    // Sonraki adımda gerçek access token alma isteğini ekleyeceğiz.

    const existingShop = await prisma.shop.findUnique({
      where: { shopDomain: shop },
    });

    if (!existingShop) {
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
          reason: "Initial free credits on Shopify install",
        },
      });
    }

    return Response.redirect(
      `${process.env.SHOPIFY_APP_URL}/dashboard/shops`
    );
  } catch (error) {
    console.error("Shopify callback error:", error);
    return Response.json({ error: "Callback failed" }, { status: 500 });
  }
}