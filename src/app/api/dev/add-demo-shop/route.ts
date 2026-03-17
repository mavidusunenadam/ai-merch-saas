import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const shop = await prisma.shop.upsert({
    where: { shopDomain: "demo-store.myshopify.com" },
    update: {},
    create: {
      shopDomain: "demo-store.myshopify.com",
      plan: "FREE",
      creditsRemaining: 10,
      isActive: true
    }
  });

  return Response.json({
    success: true,
    shop
  });
}