import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-01";

async function shopifyStorefront<T>(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(
    `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN
      },
      body: JSON.stringify({
        query,
        variables
      }),
      cache: "no-store"
    }
  );

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(JSON.stringify(json.errors || json));
  }

  return json.data as T;
}

export async function GET() {
  try {
    const query = `
      query ProductByHandle($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          options {
            name
            values
          }
          variants(first: 50) {
            nodes {
              id
              title
              availableForSale
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    `;

    const data = await shopifyStorefront<{
      product: {
        id: string;
        title: string;
        handle: string;
        options: { name: string; values: string[] }[];
        variants: {
          nodes: {
            id: string;
            title: string;
            availableForSale: boolean;
            selectedOptions: { name: string; value: string }[];
          }[];
        };
      } | null;
    }>(query, {
      handle: "custom-ai-t-shirt"
    });

    if (!data.product) {
      return NextResponse.json(
        { success: false, error: "Ürün bulunamadı. Handle kontrol et." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: data.product
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Bilinmeyen hata"
      },
      { status: 500 }
    );
  }
}