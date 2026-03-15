import { NextRequest, NextResponse } from "next/server";
import { list } from "@vercel/blob";
import type { AdminOrderItem, AdminOrderRecord } from "@/lib/admin-types";

export const runtime = "nodejs";

function isAuthorized(req: NextRequest) {
  const headerKey = req.headers.get("x-admin-key");
  const envKey = process.env.ADMIN_ACCESS_KEY;

  return !!envKey && headerKey === envKey;
}

export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { blobs } = await list({
      prefix: "orders/pending/",
      limit: 200
    });

    const jsonBlobs = blobs.filter((blob) => blob.pathname.endsWith(".json"));

    const records = await Promise.all(
      jsonBlobs.map(async (blob) => {
        const res = await fetch(blob.url, { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`JSON okunamadı: ${blob.pathname}`);
        }

        const data = (await res.json()) as AdminOrderRecord;

        const item: AdminOrderItem = {
          ...data,
          pathname: blob.pathname,
          jsonUrl: blob.url
        };

        return item;
      })
    );

    records.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      items: records
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Siparişler alınamadı."
      },
      { status: 500 }
    );
  }
}