import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getVariantId, shopifyStorefront } from "@/lib/shopify";
import { ProductSelection, TextLayer, DesignPlacement } from "@/lib/types";

export const runtime = "nodejs";

type RequestBody = {
  product: ProductSelection;
  rawDesignUrl: string;
  finalPrintUrl: string;
  textLayer: TextLayer;
  placement: DesignPlacement;
  bgRemoved: boolean;
};

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "create-cart route aktif"
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const { product, rawDesignUrl, finalPrintUrl, textLayer, placement, bgRemoved } = body;

    if (!product || !rawDesignUrl || !finalPrintUrl) {
      return NextResponse.json(
        { success: false, error: "Eksik veri gönderildi." },
        { status: 400 }
      );
    }

    const merchandiseId = getVariantId(product);
    const designRef = `EBII-${Date.now()}`;

    const metadata = {
      designRef,
      createdAt: new Date().toISOString(),
      rawDesignUrl,
      finalPrintUrl,
      product,
      textLayer,
      placement,
      bgRemoved
    };

    await put(
      `orders/pending/${designRef}.json`,
      JSON.stringify(metadata, null, 2),
      {
        access: "public",
        addRandomSuffix: false,
        contentType: "application/json"
      }
    );

    const mutation = `
      mutation CreateCart($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lines: [
          {
            merchandiseId,
            quantity: product.quantity,
            attributes: [
              { key: "design_ref", value: designRef },
              { key: "_preview_image_url", value: finalPrintUrl }
            ]
          }
        ],
        attributes: [
          { key: "source_app", value: "ai.ebiidesign.com" }
        ]
      }
    };

    const data = await shopifyStorefront<{
      cartCreate: {
        cart: {
          id: string;
          checkoutUrl: string;
        } | null;
        userErrors: {
          field: string[] | null;
          message: string;
        }[];
      };
    }>(mutation, variables);

    if (data.cartCreate.userErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: data.cartCreate.userErrors.map((e) => e.message).join(", ")
        },
        { status: 400 }
      );
    }

    if (!data.cartCreate.cart?.checkoutUrl) {
      return NextResponse.json(
        { success: false, error: "Checkout URL alınamadı." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: data.cartCreate.cart.checkoutUrl,
      designRef
    });
  } catch (error) {
    console.error("CREATE CART ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Shopify cart oluşturulamadı."
      },
      { status: 500 }
    );
  }
}