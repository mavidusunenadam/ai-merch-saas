export function getShopFromUrl(): string {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams(window.location.search);
  return params.get("shop") || "";
}