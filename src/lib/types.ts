export type StyleKey = "rockwell" | "ghibli" | "cartoon" | "caricature";

export type StyleResult = {
  key: StyleKey;
  label: string;
  prompt: string;
  url: string;
};

export type GenerateStylesResponse = {
  success: boolean;
  originalUrl?: string;
  results?: StyleResult[];
  error?: string;
};

export type StepKey = 1 | 2 | 3 | 4 | 5;

export type MockupColor = "white" | "black";
export type MockupSide = "front" | "back";

export type ProductSelection = {
  color: MockupColor;
  side: MockupSide;
  size: "S" | "M" | "L" | "XL" | "XXL";
  quantity: number;
  note?: string;
};

export type DesignPlacement = {
  x: number;
  y: number;
  width: number;
};

export type TextLayer = {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: "#ffffff" | "#111111";
};