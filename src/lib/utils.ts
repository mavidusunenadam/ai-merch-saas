export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function safeFileName(name: string) {
  const dotIndex = name.lastIndexOf(".");
  const raw = dotIndex > -1 ? name.slice(0, dotIndex) : name;
  return slugify(raw || "upload");
}

export function dataUrlToBuffer(base64: string) {
  return Buffer.from(base64, "base64");
}

export function fileExtFromMime(mime?: string) {
  if (!mime) return "png";
  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  return "png";
}