import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const templates = await prisma.productTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    return Response.json(templates);
  } catch (error) {
    console.error("Get product templates error:", error);
    return Response.json(
      { error: "Failed to load product templates" },
      { status: 500 }
    );
  }
}
