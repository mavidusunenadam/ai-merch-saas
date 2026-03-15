import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await prisma.generationSession.findUnique({
      where: { id: sessionId },
      include: {
        shop: true,
      },
    });

    if (!session) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }

    if (!session.finalImageUrl) {
      return Response.json(
        { error: "Final image is required before cart preparation" },
        { status: 400 }
      );
    }

    if (!session.shop.selectedProductTemplateId) {
      return Response.json(
        { error: "No product template selected for this shop" },
        { status: 400 }
      );
    }

    const productTemplate = await prisma.productTemplate.findUnique({
      where: { id: session.shop.selectedProductTemplateId },
    });

    if (!productTemplate) {
      return Response.json({ error: "Product template not found" }, { status: 404 });
    }

    if (!productTemplate.shopifyVariantId) {
      return Response.json(
        { error: "This product template is not mapped to a Shopify variant yet" },
        { status: 400 }
      );
    }

    const ajaxCartPayload = {
      items: [
        {
          id: Number(productTemplate.shopifyVariantId),
          quantity: 1,
          properties: {
            _builder_session_id: session.id,
            _final_image_url: session.finalImageUrl,
            _selected_result_id: session.selectedResultId || "",
            _product_template_id: productTemplate.id,
            _product_template_key: productTemplate.key,
            _product_template_name: productTemplate.name,
            _product_type: productTemplate.type,
            _print_area_x: String(productTemplate.printAreaX),
            _print_area_y: String(productTemplate.printAreaY),
            _print_area_width: String(productTemplate.printAreaWidth),
            _print_area_height: String(productTemplate.printAreaHeight),
            _source_app: "ai.ebiidesign",
          },
        },
      ],
    };

    const storefrontCartLine = {
      merchandiseId:
        productTemplate.shopifyMerchandiseId ||
        `gid://shopify/ProductVariant/${productTemplate.shopifyVariantId}`,
      quantity: 1,
      attributes: [
        { key: "_builder_session_id", value: session.id },
        { key: "_final_image_url", value: session.finalImageUrl },
        { key: "_selected_result_id", value: session.selectedResultId || "" },
        { key: "_product_template_id", value: productTemplate.id },
        { key: "_product_template_key", value: productTemplate.key },
        { key: "_product_template_name", value: productTemplate.name },
        { key: "_product_type", value: productTemplate.type },
        { key: "_print_area_x", value: String(productTemplate.printAreaX) },
        { key: "_print_area_y", value: String(productTemplate.printAreaY) },
        { key: "_print_area_width", value: String(productTemplate.printAreaWidth) },
        { key: "_print_area_height", value: String(productTemplate.printAreaHeight) },
        { key: "_source_app", value: "ai.ebiidesign" },
      ],
    };

   const merchantStoreDomain = session.shop.shopDomain;

const internalCartPayload = {
  sessionId: session.id,
  shopDomain: merchantStoreDomain,
  productTemplateId: productTemplate.id,
  productTemplateKey: productTemplate.key,
  productName: productTemplate.name,
  productType: productTemplate.type,
  finalImageUrl: session.finalImageUrl,
  selectedResultId: session.selectedResultId,
  quantity: 1,
  shopifyVariantId: productTemplate.shopifyVariantId,
  shopifyMerchandiseId:
    productTemplate.shopifyMerchandiseId ||
    `gid://shopify/ProductVariant/${productTemplate.shopifyVariantId}`,
  customization: {
    printAreaX: productTemplate.printAreaX,
    printAreaY: productTemplate.printAreaY,
    printAreaWidth: productTemplate.printAreaWidth,
    printAreaHeight: productTemplate.printAreaHeight,
  },
  ajaxCartUrl: `https://${merchantStoreDomain}/cart/add.js`,
  ajaxCartPayload,
  storefrontCartLine,
};


    const updatedSession = await prisma.generationSession.update({
      where: { id: session.id },
      data: {
        selectedProductTemplateId: productTemplate.id,
        cartPayloadJson: JSON.stringify(internalCartPayload),
        status: "cart_ready",
      },
    });

    return Response.json({
      success: true,
      session: updatedSession,
      cartPayload: internalCartPayload,
    });
  } catch (error) {
    console.error("Prepare cart error:", error);
    return Response.json(
      { error: "Failed to prepare cart payload" },
      { status: 500 }
    );
  }
}
