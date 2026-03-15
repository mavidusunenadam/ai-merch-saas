"use client";

import { ProductSelection } from "@/lib/types";

type Props = {
  product: ProductSelection;
  onUpdate: (updates: Partial<ProductSelection>) => void;
};

export default function StepProduct({ product, onUpdate }: Props) {
  return (
    <div className="card card-pad">
      <div className="mb-6">
        <span className="badge">4. Adım</span>
        <h2 className="section-title">Ürün seçenekleri</h2>
        <p className="section-text">
          Tişört rengi, baskı yüzü, beden ve adet seçimini yap.
        </p>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <label className="field-label">Renk</label>
          <select
            className="field-select"
            value={product.color}
            onChange={(e) => onUpdate({ color: e.target.value as ProductSelection["color"] })}
          >
            <option value="white">Beyaz</option>
            <option value="black">Siyah</option>
          </select>
        </div>

        <div className="card card-pad">
          <label className="field-label">Baskı Yüzü</label>
          <select
            className="field-select"
            value={product.side}
            onChange={(e) => onUpdate({ side: e.target.value as ProductSelection["side"] })}
          >
            <option value="front">Ön</option>
            <option value="back">Arka</option>
          </select>
        </div>

        <div className="card card-pad">
          <label className="field-label">Beden</label>
          <select
            className="field-select"
            value={product.size}
            onChange={(e) => onUpdate({ size: e.target.value as ProductSelection["size"] })}
          >
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
			<option value="XXL">XXL</option>
          </select>
        </div>

        <div className="card card-pad">
          <label className="field-label">Adet</label>
          <input
            type="number"
            min={1}
            max={10}
            className="field-input"
            value={product.quantity}
            onChange={(e) => onUpdate({ quantity: Number(e.target.value) || 1 })}
          />
        </div>
      </div>
    </div>
  );
}