import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const prompts = await prisma.promptPreset.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        title: "asc"
      }
    });

    return Response.json(prompts);
  } catch (error) {
    return Response.json({ error: "Failed to load prompts" }, { status: 500 });
  }
}
