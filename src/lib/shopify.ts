import { ProductSelection } from "@/lib/types";

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-01";

if (!SHOPIFY_STORE_DOMAIN) {
  throw new Error("SHOPIFY_STORE_DOMAIN tanımlı değil.");
}

if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  throw new Error("SHOPIFY_STOREFRONT_ACCESS_TOKEN tanımlı değil.");
}

export async function shopifyStorefront<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
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

const VARIANT_MAP: Record<"black" | "white", Record<"S" | "M" | "L" | "XL" | "XXL", string>> = {
  black: {
    S: "gid://shopify/ProductVariant/43015931297882",
    M: "gid://shopify/ProductVariant/43015931363418",
    L: "gid://shopify/ProductVariant/43015931428954",
    XL: "gid://shopify/ProductVariant/43015931494490",
    XXL: "gid://shopify/ProductVariant/43015931560026"
  },
  white: {
    S: "gid://shopify/ProductVariant/43015931330650",
    M: "gid://shopify/ProductVariant/43015931396186",
    L: "gid://shopify/ProductVariant/43015931461722",
    XL: "gid://shopify/ProductVariant/43015931527258",
    XXL: "gid://shopify/ProductVariant/43015931592794"
  }
};

export function getVariantId(product: ProductSelection): string {
  const colorKey = product.color === "black" ? "black" : "white";
  return VARIANT_MAP[colorKey][product.size];
}