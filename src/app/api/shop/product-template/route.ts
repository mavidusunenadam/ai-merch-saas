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
        selectedProductTemplateId: true,
      },
    });

    if (!shop) {
      return Response.json({ error: "Shop not found" }, { status: 404 });
    }

    return Response.json(shop);
  } catch (error) {
    console.error("Get selected product template error:", error);
    return Response.json(
      { error: "Failed to load selected product template" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const shopDomain = getDevShopDomainFromRequest(req);
    const body = await req.json();
    const { productTemplateId } = body;

    if (!productTemplateId) {
      return Response.json(
        { error: "productTemplateId is required" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
    });

    if (!shop) {
      return Response.json({ error: "Shop not found" }, { status: 404 });
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        selectedProductTemplateId: productTemplateId,
      },
    });

    return Response.json({
      success: true,
      selectedProductTemplateId: updatedShop.selectedProductTemplateId,
    });
  } catch (error) {
    console.error("Save product template error:", error);
    return Response.json(
      { error: "Failed to save selected product template" },
      { status: 500 }
    );
  }
}
