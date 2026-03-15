import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shopDomain: true,
        plan: true,
        creditsRemaining: true,
        isActive: true,
        createdAt: true,
      },
    });

    return Response.json(shops);
  } catch (error) {
    console.error("Get shops error:", error);
    return Response.json({ error: "Failed to load shops" }, { status: 500 });
  }
}
