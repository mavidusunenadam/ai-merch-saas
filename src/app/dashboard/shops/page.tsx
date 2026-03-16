"use client";

import { useEffect, useState } from "react";

type Shop = {
  id: string;
  shopDomain: string;
  plan: string;
  creditsRemaining: number;
  isActive: boolean;
  createdAt: string;
};

export default function DashboardShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeShop, setActiveShop] = useState<string>("");

  useEffect(() => {
  const fetchShops = async () => {
  try {
    const res = await fetch("/api/dev/shops");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to load shops");
    }

    setShops(Array.isArray(data) ? data : []);

    const saved = window.localStorage.getItem("activeDevShopDomain");
    if (saved) {
      setActiveShop(saved);
    }
  } catch (error) {
    console.error("Failed to load shops:", error);
    setShops([]);
  } finally {
    setLoading(false);
  }
};

    fetchShops();
  }, []);

  const handleSetActiveShop = (shopDomain: string) => {
    window.localStorage.setItem("activeDevShopDomain", shopDomain);
    setActiveShop(shopDomain);
  };

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <div className="card">Loading shops...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dev Shop Switcher</h1>
          <p className="page-subtitle">
            Choose which merchant store is active in your development environment.
          </p>
        </div>

        <div className="grid gap-4">
          {shops.map((shop) => {
            const isSelected = activeShop === shop.shopDomain;

            return (
              <div
                key={shop.id}
                className={`card-soft ${
                  isSelected ? "border-gray-900 ring-1 ring-gray-900/10" : ""
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {shop.shopDomain}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Plan: {shop.plan} · Credits: {shop.creditsRemaining}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSetActiveShop(shop.shopDomain)}
                    className={isSelected ? "btn-primary" : "btn-secondary"}
                  >
                    {isSelected ? "Active Shop" : "Set Active"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="status-box mt-6">
          Current active shop:{" "}
          <span className="font-semibold text-gray-900">
            {activeShop || "None selected"}
          </span>
        </div>
      </div>
    </main>
  );
}
