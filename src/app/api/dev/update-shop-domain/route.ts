import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const shop = await prisma.shop.findUnique({
      where: { shopDomain: "dev-store.local" },
    });

    if (!shop) {
      return Response.json({ error: "Old dev shop not found" }, { status: 404 });
    }

    const updated = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        shopDomain: "demo-store.myshopify.com",
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Update shop domain error:", error);
    return Response.json(
      { error: "Failed to update shop domain" },
      { status: 500 }
    );
  }
}
