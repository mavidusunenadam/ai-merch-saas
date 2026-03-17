import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const promptPresets = [
  {
    key: "anime",
    title: "Anime Style",
    description: "Clean anime-inspired illustration look.",
    promptText:
      "Transform the uploaded image into a clean anime-style illustration with detailed facial features, smooth shading, stylish colors, and a print-ready composition suitable for a t-shirt design.",
    previewImage: "/prompt-previews/anime.jpg",
  },
  {
    key: "cartoon",
    title: "Cartoon Style",
    description: "Fun cartoon look with bold shapes.",
    promptText:
      "Transform the uploaded image into a bold cartoon-style design with expressive outlines, simplified forms, vibrant energy, and a print-ready composition suitable for merch.",
    previewImage: "/prompt-previews/cartoon.jpg",
  },
  {
    key: "ghibli",
    title: "Ghibli Inspired",
    description: "Soft dreamy illustration feel.",
    promptText:
      "Transform the uploaded image into a soft, dreamy, hand-painted illustration inspired by whimsical animated film aesthetics, with gentle colors and a print-friendly composition for apparel.",
    previewImage: "/prompt-previews/ghibli.jpg",
  },
  {
    key: "retro_vintage",
    title: "Retro Vintage",
    description: "Vintage poster-like merch style.",
    promptText:
      "Transform the uploaded image into a retro vintage t-shirt graphic with aged poster aesthetics, balanced colors, bold composition, and a stylish print-ready design.",
    previewImage: "/prompt-previews/retro-vintage.jpg",
  },
  {
    key: "comic_book",
    title: "Comic Book",
    description: "Dynamic comic illustration style.",
    promptText:
      "Transform the uploaded image into a dynamic comic book style design with inked outlines, dramatic contrast, graphic impact, and a merch-ready composition.",
    previewImage: "/prompt-previews/comic-book.jpg",
  },
  {
    key: "watercolor",
    title: "Watercolor Art",
    description: "Soft watercolor painting look.",
    promptText:
      "Transform the uploaded image into a watercolor art style with painterly texture, soft blending, artistic depth, and a clean print-ready layout for apparel.",
    previewImage: "/prompt-previews/watercolor.jpg",
  },
  {
    key: "pop_art",
    title: "Pop Art",
    description: "Bold pop art with strong contrast.",
    promptText:
      "Transform the uploaded image into a pop art inspired design with bold graphic shapes, high contrast, expressive colors, and a standout composition for merchandise.",
    previewImage: "/prompt-previews/pop-art.jpg",
  },
  {
    key: "pencil_sketch",
    title: "Pencil Sketch",
    description: "Classic hand-drawn sketch style.",
    promptText:
      "Transform the uploaded image into a refined pencil sketch illustration with artistic line work, subtle shading, and a clean t-shirt friendly layout.",
    previewImage: "/prompt-previews/pencil-sketch.jpg",
  },
  {
    key: "cyberpunk",
    title: "Cyberpunk Neon",
    description: "Futuristic neon tech vibe.",
    promptText:
      "Transform the uploaded image into a cyberpunk neon style design with futuristic atmosphere, glowing accents, strong subject focus, and a high-impact merch composition.",
    previewImage: "/prompt-previews/cyberpunk.jpg",
  },
  {
    key: "realistic_poster",
    title: "Realistic Poster",
    description: "Premium poster-quality realistic look.",
    promptText:
      "Transform the uploaded image into a high-detail realistic poster-style graphic with strong subject clarity, premium visual impact, and a print-ready t-shirt composition.",
    previewImage: "/prompt-previews/realistic-poster.jpg",
  },
];

const productTemplates = [
  {
    key: "tshirt_basic",
    name: "Basic T-Shirt",
    type: "tshirt",
    mockupImage: "/mockups/tshirt-basic.png",
    printAreaX: 90,
    printAreaY: 140,
    printAreaWidth: 220,
    printAreaHeight: 220,
  },
  {
    key: "hoodie_basic",
    name: "Basic Hoodie",
    type: "hoodie",
    mockupImage: "/mockups/hoodie-basic.png",
    printAreaX: 85,
    printAreaY: 170,
    printAreaWidth: 230,
    printAreaHeight: 230,
  },
  {
    key: "sweatshirt_basic",
    name: "Basic Sweatshirt",
    type: "sweatshirt",
    mockupImage: "/mockups/sweatshirt-basic.png",
    printAreaX: 90,
    printAreaY: 160,
    printAreaWidth: 220,
    printAreaHeight: 220,
  },
];

async function main() {
  for (const product of productTemplates) {
    await prisma.productTemplate.upsert({
      where: { key: product.key },
      update: {
        name: product.name,
        type: product.type,
        mockupImage: product.mockupImage,
        printAreaX: product.printAreaX,
        printAreaY: product.printAreaY,
        printAreaWidth: product.printAreaWidth,
        printAreaHeight: product.printAreaHeight,
        isActive: true,
      },
      create: {
        key: product.key,
        name: product.name,
        type: product.type,
        mockupImage: product.mockupImage,
        printAreaX: product.printAreaX,
        printAreaY: product.printAreaY,
        printAreaWidth: product.printAreaWidth,
        printAreaHeight: product.printAreaHeight,
        isActive: true,
      },
    });
  }

  for (const preset of promptPresets) {
    await prisma.promptPreset.upsert({
      where: { key: preset.key },
      update: {
        title: preset.title,
        description: preset.description,
        promptText: preset.promptText,
        previewImage: preset.previewImage,
        isActive: true,
      },
      create: {
        key: preset.key,
        title: preset.title,
        description: preset.description,
        promptText: preset.promptText,
        previewImage: preset.previewImage,
        isActive: true,
      },
    });
  }

  const shop = await prisma.shop.findUnique({
  where: { shopDomain: "demo-store.myshopify.com" },
});

if (!shop) {
  console.log("⚠️ Shop not found for prompt assignment.");
  return;
}

const presets = await prisma.promptPreset.findMany();

for (const preset of presets) {
  await prisma.shopPromptSelection.upsert({
    where: {
      shopId_promptPresetId: {
        shopId: shop.id,
        promptPresetId: preset.id,
      },
    },
    update: {},
    create: {
      shopId: shop.id,
      promptPresetId: preset.id,
    },
  });
}

  console.log("Seeding prompts for shop:", shop.shopDomain);

  console.log("✅ Prompt presets seeded successfully.");
  console.log("✅ Product templates seeded successfully.");
  console.log("✅ Demo shop prompt selections seeded successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });