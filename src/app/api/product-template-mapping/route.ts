import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      productTemplateId,
      shopifyProductId,
      shopifyVariantId,
      shopifyMerchandiseId,
    } = body;

    if (!productTemplateId || !shopifyVariantId) {
      return Response.json(
        { error: "productTemplateId and shopifyVariantId are required" },
        { status: 400 }
      );
    }

    const updatedTemplate = await prisma.productTemplate.update({
      where: { id: productTemplateId },
      data: {
        shopifyProductId: shopifyProductId || null,
        shopifyVariantId,
        shopifyMerchandiseId: shopifyMerchandiseId || null,
      },
    });

    return Response.json({
      success: true,
      productTemplate: updatedTemplate,
    });
  } catch (error) {
    console.error("Mapping save error:", error);
    return Response.json(
      { error: "Failed to save Shopify mapping" },
      { status: 500 }
    );
  }
}
