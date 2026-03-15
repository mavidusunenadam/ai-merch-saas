"use client";

import { useEffect, useState } from "react";
import { fetchWithActiveShop } from "@/lib/fetch-with-shop";

type ProductTemplate = {
  id: string;
  name: string;
  type: string;
  key: string;
  shopifyProductId: string | null;
  shopifyVariantId: string | null;
  shopifyMerchandiseId: string | null;
};

type ShopifyVariant = {
  productId: string;
  variantId: string;
  merchandiseId: string;
  productTitle: string;
  variantTitle: string;
};

export default function MappingPage() {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [variants, setVariants] = useState<ShopifyVariant[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      const [templatesRes, variantsRes] = await Promise.all([
        fetchWithActiveShop("/api/product-templates"),
        fetchWithActiveShop("/api/dev/shopify-variants"),
      ]);

      const templatesData = await templatesRes.json();
      const variantsData = await variantsRes.json();

      setTemplates(templatesData || []);
      setVariants(variantsData || []);
    } catch (error) {
      console.error("Failed to load mapping data:", error);
      setMessage("Failed to load mapping data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    try {
      setMessage("");

      if (!selectedTemplateId || !selectedVariantId) {
        alert("Please select both a product template and a Shopify variant.");
        return;
      }

      const variant = variants.find((v) => v.variantId === selectedVariantId);
      if (!variant) {
        alert("Selected Shopify variant was not found.");
        return;
      }

      setSaving(true);

      const res = await fetchWithActiveShop("/api/product-template-mapping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productTemplateId: selectedTemplateId,
          shopifyProductId: variant.productId,
          shopifyVariantId: variant.variantId,
          shopifyMerchandiseId: variant.merchandiseId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save mapping");
      }

      setMessage("Mapping saved successfully.");
      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Failed to save mapping.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <div className="card">Loading mappings...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Shopify Variant Mapping</h1>
          <p className="page-subtitle">
            Connect each product template to a Shopify product variant so the builder can prepare cart-ready payloads.
          </p>
        </div>

        <div className="card mb-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Product Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="input-basic"
              >
                <option value="">Select template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">
                Shopify Variant
              </label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="input-basic"
              >
                <option value="">Select Shopify variant</option>
                {variants.map((variant) => (
                  <option key={variant.variantId} value={variant.variantId}>
                    {variant.productTitle} — {variant.variantTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Mapping"}
            </button>

            {message && <div className="status-box">{message}</div>}
          </div>
        </div>

        <div className="card">
          <div className="mb-5">
            <h2 className="section-title">Current Template Mappings</h2>
            <p className="muted-text mt-2">
              Review which templates are already connected to Shopify variants.
            </p>
          </div>

          <div className="grid-cards">
            {templates.map((template) => {
              const isMapped = Boolean(template.shopifyVariantId);

              return (
                <div
                  key={template.id}
                  className={`card-soft ${
                    isMapped ? "border-green-200 bg-green-50/40" : ""
                  }`}
                >
                  <div className="mb-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {template.type}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.name}
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Template key: {template.key}
                  </p>

                  <div className="mt-5 space-y-3 rounded-xl bg-white/70 p-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Variant ID
                      </p>
                      <p className="mt-1 break-all text-sm text-gray-700">
                        {template.shopifyVariantId || "Not mapped yet"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Merchandise ID
                      </p>
                      <p className="mt-1 break-all text-sm text-gray-700">
                        {template.shopifyMerchandiseId || "Not mapped yet"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Product ID
                      </p>
                      <p className="mt-1 break-all text-sm text-gray-700">
                        {template.shopifyProductId || "Not mapped yet"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        isMapped
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isMapped ? "Mapped" : "Needs mapping"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
