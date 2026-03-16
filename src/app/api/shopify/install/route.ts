import crypto from "crypto";

function buildInstallUrl(shop: string) {
  const apiKey = process.env.SHOPIFY_API_KEY!;
  const scopes = process.env.SHOPIFY_SCOPES!;
  const appUrl = process.env.SHOPIFY_APP_URL!;

  const redirectUri = `${appUrl}/api/shopify/auth/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    client_id: apiKey,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  return `https://${shop}/admin/oauth/authorize?${params.toString()}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get("shop");

    if (!shop) {
      return Response.json({ error: "shop is required" }, { status: 400 });
    }

    const installUrl = buildInstallUrl(shop);

    return Response.redirect(installUrl);
  } catch (error) {
    console.error("Shopify install error:", error);
    return Response.json({ error: "Failed to start install" }, { status: 500 });
  }
}