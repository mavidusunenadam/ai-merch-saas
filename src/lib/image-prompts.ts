import { StyleKey } from "./types";

export const STYLE_CONFIG: Record<
  StyleKey,
  { label: string; prompt: string }
> = {
  rockwell: {
    label: "Rockwell Style",
    prompt:
      "Transform this portrait into a Norman Rockwell-inspired vintage American illustration. Keep the same person, pose, facial identity, clothing structure, and composition recognizable. Add warm painterly brushwork, nostalgic storytelling, slightly idealized expressions, magazine-cover illustration feel, detailed shadows, print-ready clean subject, centered composition, no extra fingers, no text, no watermark."
  },
  ghibli: {
    label: "Ghibli Style",
    prompt:
      "Transform this portrait into a whimsical hand-painted Ghibli-inspired illustration. Preserve the same person, identity, expression, pose, and clothing silhouette. Soft pastel palette, dreamy atmosphere, painterly anime background treatment, charming and cinematic mood, clean subject edges, print-ready quality, no text, no watermark."
  },
  cartoon: {
    label: "Cartoon Style",
    prompt:
      "Transform this photo into a clean, modern cartoon illustration. Preserve the person, pose, clothing, composition, and full framing. Keep the subject fully visible and do not crop the head or body. Smooth outlines, stylized features, vibrant but balanced colors, premium cartoon character style."
  },
  caricature: {
    label: "Caricature Style",
    prompt:
      "Transform this portrait into a high-quality caricature illustration for t-shirt print. Preserve the same person's identity clearly, but exaggerate facial features in a fun, stylish, tasteful way. Bold outlines, lively color palette, print-ready isolated subject, clean composition, no text, no watermark."
  }
};

export const STYLE_ORDER: StyleKey[] = [
  "rockwell",
  "ghibli",
  "cartoon",
  "caricature"
];