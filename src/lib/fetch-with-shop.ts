import { getShopHeaderFromUrl } from "@/lib/shop-param";

export async function fetchWithActiveShop(
  input: RequestInfo | URL,
  init?: RequestInit
) {
  const headers = new Headers(init?.headers || {});
  const urlShop = getShopHeaderFromUrl();

  const activeShop =
    urlShop ||
    (typeof window !== "undefined"
      ? window.localStorage.getItem("activeDevShopDomain")
      : null);

  if (activeShop) {
    headers.set("x-dev-shop-domain", activeShop);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
