import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const shopDomain = url.searchParams.get("shop");

    if (!shopDomain) {
      return Response.json(
        { error: "Shop missing in request" },
        { status: 400 }
      );
    }

    const shop = await prisma.shop.findUnique({
      where: { shopDomain }
    });

    if (!shop) {
      return Response.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    if (shop.creditsRemaining <= 0) {
      return Response.json(
        { error: "No credits remaining" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const prompts = await prisma.promptPreset.findMany({
      where: { isActive: true }
    });

    if (!prompts.length) {
      return Response.json(
        { error: "No prompts configured" },
        { status: 500 }
      );
    }

    const results = [];

    for (const preset of prompts.slice(0, 4)) {
      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: buffer,
        prompt: preset.promptText,
        size: "1024x1024"
      });

      const image = response.data[0];

      results.push({
        key: preset.key,
        title: preset.title,
        url: `data:image/png;base64,${image.b64_json}`
      });
    }

    await prisma.shop.update({
      where: { id: shop.id },
      data: {
        creditsRemaining: {
          decrement: 1
        }
      }
    });

    return Response.json({
      success: true,
      results,
      creditsRemaining: shop.creditsRemaining - 1
    });

  } catch (error) {
    console.error("GENERATE STYLES ERROR:", error);

    return Response.json(
      {
        error: "Image generation failed"
      },
      { status: 500 }
    );
  }
}