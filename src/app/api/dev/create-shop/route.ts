import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const existingShop = await prisma.shop.findUnique({
      where: {
        shopDomain: "dev-store.local",
      },
    });

    if (existingShop) {
      return Response.json(existingShop);
    }

    const shop = await prisma.shop.create({
      data: {
        shopDomain: "demo-store.myshopify.com",
        plan: "FREE",
        creditsRemaining: 10,
      },
    });

    return Response.json(shop);
  } catch (error) {
    console.error("Create shop error:", error);
    return Response.json(
      { error: "Failed to create dev shop" },
      { status: 500 }
    );
  }
}
