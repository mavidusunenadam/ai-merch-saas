import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const shop = await prisma.shop.upsert({
      where: { shopDomain: "demo-store.myshopify.com" },
      update: {},
      create: {
        shopDomain: "demo-store.myshopify.com",
        plan: "FREE",
        creditsRemaining: 10,
        isActive: true,
      },
    });

    const hoodie = await prisma.productTemplate.upsert({
      where: { key: "hoodie_basic" },
      update: {
        name: "Basic Hoodie",
        type: "hoodie",
        mockupImage: "/mockups/hoodie-basic.png",
        printAreaX: 85,
        printAreaY: 170,
        printAreaWidth: 230,
        printAreaHeight: 230,
        isActive: true,
        shopifyProductId: "gid://shopify/Product/1002",
        shopifyVariantId: "22222222222222",
        shopifyMerchandiseId: "gid://shopify/ProductVariant/22222222222222",
      },
      create: {
        key: "hoodie_basic",
        name: "Basic Hoodie",
        type: "hoodie",
        mockupImage: "/mockups/hoodie-basic.png",
        printAreaX: 85,
        printAreaY: 170,
        printAreaWidth: 230,
        printAreaHeight: 230,
        isActive: true,
        shopifyProductId: "gid://shopify/Product/1002",
        shopifyVariantId: "22222222222222",
        shopifyMerchandiseId: "gid://shopify/ProductVariant/22222222222222",
      },
    });

    await prisma.shop.update({
      where: { id: shop.id },
      data: {
        selectedProductTemplateId: hoodie.id,
      },
    });

    const presets = await prisma.promptPreset.findMany();

    for (const preset of presets) {
      await prisma.shopPromptSelection.upsert({
        where: {
          shopId_promptPresetId: {
            shopId: shop.id,
            promptPresetId: preset.id,
          },
        },
        update: {},
        create: {
          shopId: shop.id,
          promptPresetId: preset.id,
        },
      });
    }

    const refreshedShop = await prisma.shop.findUnique({
      where: { id: shop.id },
      include: {
        promptSelections: {
          include: {
            promptPreset: true,
          },
        },
      },
    });

    return Response.json({
      success: true,
      message: "Demo store setup completed",
      shop: {
        id: refreshedShop?.id,
        shopDomain: refreshedShop?.shopDomain,
        selectedProductTemplateId: refreshedShop?.selectedProductTemplateId,
        creditsRemaining: refreshedShop?.creditsRemaining,
        promptCount: refreshedShop?.promptSelections.length ?? 0,
      },
      productTemplate: {
        id: hoodie.id,
        key: hoodie.key,
        shopifyVariantId: hoodie.shopifyVariantId,
      },
    });
  } catch (error) {
    console.error("Setup demo store error:", error);

    return Response.json(
      {
        error: "Failed to setup demo store",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}