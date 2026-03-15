import { PrismaClient } from "@prisma/client";
import { getDevShopDomainFromRequest } from "@/lib/dev-shop";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryShop = searchParams.get("shop");
    const shopDomain = queryShop || getDevShopDomainFromRequest(req);

    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
      include: {
        promptSelections: {
          include: {
            promptPreset: true,
          },
        },
      },
    });

    if (!shop) {
      return Response.json(
        {
          ok: false,
          code: "SHOP_NOT_FOUND",
          message: "Store not found.",
          shopDomain,
        },
        { status: 404 }
      );
    }

    if (shop.promptSelections.length === 0) {
      return Response.json({
        ok: false,
        code: "NO_PROMPTS",
        message: "This store has no active styles configured yet.",
        shopDomain,
      });
    }

    if (!shop.selectedProductTemplateId) {
      return Response.json({
        ok: false,
        code: "NO_PRODUCT_SELECTED",
        message: "This store has no product template selected.",
        shopDomain,
      });
    }

    const productTemplate = await prisma.productTemplate.findUnique({
      where: { id: shop.selectedProductTemplateId },
    });

    if (!productTemplate) {
      return Response.json({
        ok: false,
        code: "PRODUCT_NOT_FOUND",
        message: "Selected product template was not found.",
        shopDomain,
      });
    }

    if (!productTemplate.shopifyVariantId) {
      return Response.json({
        ok: false,
        code: "PRODUCT_NOT_MAPPED",
        message: "The selected product is not mapped to a Shopify variant yet.",
        shopDomain,
        productTemplate: {
          id: productTemplate.id,
          name: productTemplate.name,
        },
      });
    }

    return Response.json({
      ok: true,
      code: "READY",
      message: "Builder is ready.",
      shop: {
        id: shop.id,
        shopDomain: shop.shopDomain,
        creditsRemaining: shop.creditsRemaining,
        selectedProductTemplateId: shop.selectedProductTemplateId,
      },
      promptCount: shop.promptSelections.length,
      productTemplate: {
        id: productTemplate.id,
        name: productTemplate.name,
        type: productTemplate.type,
        shopifyVariantId: productTemplate.shopifyVariantId,
      },
    });
  } catch (error) {
    console.error("Storefront health error:", error);
    return Response.json(
      {
        ok: false,
        code: "SERVER_ERROR",
        message: "Failed to check storefront readiness.",
      },
      { status: 500 }
    );
  }
}
