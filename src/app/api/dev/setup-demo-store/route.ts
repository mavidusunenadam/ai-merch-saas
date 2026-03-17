import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const shop = await prisma.shop.findUnique({
      where: { shopDomain: "demo-store.myshopify.com" },
    });

    if (!shop) {
      return Response.json({ error: "Demo shop not found" }, { status: 404 });
    }

    const hoodie = await prisma.productTemplate.findUnique({
      where: { key: "hoodie_basic" },
    });

    if (!hoodie) {
      return Response.json({ error: "hoodie_basic template not found" }, { status: 404 });
    }

    const updatedTemplate = await prisma.productTemplate.update({
      where: { id: hoodie.id },
      data: {
        shopifyProductId: "gid://shopify/Product/1002",
        shopifyVariantId: "22222222222222",
        shopifyMerchandiseId: "gid://shopify/ProductVariant/22222222222222",
      },
    });

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        selectedProductTemplateId: hoodie.id,
      },
    });

    return Response.json({
      success: true,
      message: "Demo store setup completed",
      shop: updatedShop,
      productTemplate: updatedTemplate,
    });
  } catch (error) {
    console.error("Setup demo store error:", error);
    return Response.json(
      { error: "Failed to setup demo store" },
      { status: 500 }
    );
  }
}