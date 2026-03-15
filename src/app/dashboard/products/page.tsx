"use client";

import { useEffect, useState } from "react";
import { fetchWithActiveShop } from "@/lib/fetch-with-shop";

type ProductTemplate = {
  id: string;
  key: string;
  name: string;
  type: string;
  mockupImage: string | null;
  printAreaX: number;
  printAreaY: number;
  printAreaWidth: number;
  printAreaHeight: number;
};

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<ProductTemplate[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, selectedRes] = await Promise.all([
          fetchWithActiveShop("/api/product-templates"),
          fetchWithActiveShop("/api/shop/product-template"),
        ]);

        const productsData = await productsRes.json();
        const selectedData = await selectedRes.json();

        setProducts(productsData || []);
        setSelectedProductId(selectedData.selectedProductTemplateId || null);
      } catch (error) {
        console.error("Failed to load products:", error);
        setMessage("Failed to load product templates.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      if (!selectedProductId) {
        alert("Please select a product first.");
        return;
      }

      setSaving(true);
      setMessage("");

      const res = await fetchWithActiveShop("/api/shop/product-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productTemplateId: selectedProductId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save product");
      }

      setMessage("Selected product saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save selected product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <div className="card">Loading product templates...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Product Templates</h1>
          <p className="page-subtitle">
            Choose the product customers will preview in the builder before adding to cart.
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="section-title">Storefront Product Setup</h2>
              <p className="muted-text mt-2">
                The selected product template controls the preview layout and print area.
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>

          {message && <div className="status-box mt-4">{message}</div>}
        </div>

        <div className="grid-cards">
          {products.map((product) => {
            const isSelected = selectedProductId === product.id;

            return (
              <button
                key={product.id}
                onClick={() => setSelectedProductId(product.id)}
                className={`card-soft text-left ${
                  isSelected ? "border-gray-900 ring-1 ring-gray-900/10" : ""
                }`}
              >
                <div className="flex h-full flex-col">
                  <div className="mb-4 inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {product.type}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900">
                    {product.name}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Template key: {product.key}
                  </p>

                  <div className="mt-5 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Mockup asset
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {product.mockupImage || "No mockup image set yet"}
                    </p>
                  </div>

                  <div className="mt-4 flex-1 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Print area
                    </p>

                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p>
                        Position: {product.printAreaX}, {product.printAreaY}
                      </p>
                      <p>
                        Size: {product.printAreaWidth} × {product.printAreaHeight}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div
                      className={
                        isSelected
                          ? "btn-primary w-full"
                          : "btn-secondary w-full"
                      }
                    >
                      {isSelected ? "Selected Product" : "Select Product"}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
