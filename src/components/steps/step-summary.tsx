"use client";

import MockupPreview from "@/components/mockup-preview";
import {
  DesignPlacement,
  ProductSelection,
  TextLayer
} from "@/lib/types";

type Props = {
  designUrl: string | null;
  product: ProductSelection;
  placement: DesignPlacement;
  textLayer: TextLayer;
  onUpdateProduct: (updates: Partial<ProductSelection>) => void;
};

export default function StepSummary({
  designUrl,
  product,
  placement,
  textLayer,
  onUpdateProduct
}: Props) {
  return (
    <div className="card card-pad">
      <div className="mb-6">
        <span className="badge">5. Adım</span>
        <h2 className="section-title">Son kontrol</h2>
        <p className="section-text">
          Seçimlerini kontrol et, sonra Shopify sepetine gönderelim.
        </p>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <h3 className="font-bold mb-3">Düzenlenmiş tasarım</h3>

          <MockupPreview
            designUrl={designUrl}
            color={product.color}
            side={product.side}
            placement={placement}
            textLayer={textLayer}
          />
        </div>

        <div className="card card-pad">
          <h3 className="font-bold mb-3">Ürün özeti</h3>

          <div className="summary-list text-sm text-gray">
            <p><strong>Renk:</strong> {product.color === "white" ? "Beyaz" : "Siyah"}</p>
            <p><strong>Yüz:</strong> {product.side === "front" ? "Ön" : "Arka"}</p>
            <p><strong>Beden:</strong> {product.size}</p>
            <p><strong>Adet:</strong> {product.quantity}</p>
            {textLayer.text.trim() && (
              <p><strong>Yazı:</strong> {textLayer.text}</p>
            )}
          </div>

          <div className="mt-6">
            <label className="field-label">
              Eklemek istediğiniz bir not var mı?
            </label>

            <textarea
              className="field-input"
              rows={4}
              placeholder="Örn: Yazı biraz daha yukarı basılabilir mi?"
              value={product.note || ""}
              onChange={(e) =>
                onUpdateProduct({
                  note: e.target.value
                })
              }
            />

            <p className="helper mt-2">
              Üretim ekibine iletilmesini istediğiniz ekstra bir not varsa buraya yazabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}