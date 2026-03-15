export type AdminOrderRecord = {
  designRef: string;
  createdAt: string;
  rawDesignUrl: string;
  finalPrintUrl: string;
  product: {
    color: "white" | "black";
    side: "front" | "back";
    size: "S" | "M" | "L" | "XL" | "XXL";
    quantity: number;
    note?: string;
  };
  textLayer: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: "#ffffff" | "#111111";
  };
  placement: {
    x: number;
    y: number;
    width: number;
  };
  bgRemoved: boolean;
};

export type AdminOrderItem = AdminOrderRecord & {
  pathname: string;
  jsonUrl: string;
};