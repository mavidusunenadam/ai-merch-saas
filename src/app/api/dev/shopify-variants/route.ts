export async function GET() {
  const variants = [
    {
      productId: "gid://shopify/Product/1001",
      variantId: "11111111111111",
      merchandiseId: "gid://shopify/ProductVariant/11111111111111",
      productTitle: "Classic White T-Shirt",
      variantTitle: "White / M",
    },
    {
      productId: "gid://shopify/Product/1002",
      variantId: "22222222222222",
      merchandiseId: "gid://shopify/ProductVariant/22222222222222",
      productTitle: "Basic Black Hoodie",
      variantTitle: "Black / L",
    },
    {
      productId: "gid://shopify/Product/1003",
      variantId: "33333333333333",
      merchandiseId: "gid://shopify/ProductVariant/33333333333333",
      productTitle: "Oversize Sweatshirt",
      variantTitle: "Gray / XL",
    },
  ];

  return Response.json(variants);
}
