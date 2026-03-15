export const DEFAULT_DEV_SHOP_DOMAIN = "dev-store.local";

export function getDevShopDomainFromRequest(req: Request) {
  const headerShop = req.headers.get("x-dev-shop-domain");

  if (headerShop) {
    return headerShop;
  }

  return DEFAULT_DEV_SHOP_DOMAIN;
}
