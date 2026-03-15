"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminOrderItem } from "@/lib/admin-types";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const key = window.localStorage.getItem("ebii_admin_key") || "";
    if (key) {
      setAdminKey(key);
      setSaved(true);
    }
  }, []);

  async function loadOrders(keyOverride?: string) {
    const key = keyOverride ?? adminKey;

    if (!key) {
      setError("Önce admin anahtarını gir.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "GET",
        headers: {
          "x-admin-key": key
        },
        cache: "no-store"
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Siparişler alınamadı.");
      }

      setOrders(json.items || []);
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  function handleSaveKey() {
    if (!adminKey.trim()) return;
    window.localStorage.setItem("ebii_admin_key", adminKey.trim());
    setSaved(true);
    loadOrders(adminKey.trim());
  }

  function handleClearKey() {
    window.localStorage.removeItem("ebii_admin_key");
    setSaved(false);
    setAdminKey("");
    setOrders([]);
    setError("");
  }

  useEffect(() => {
    if (saved && adminKey) {
      loadOrders(adminKey);
    }
  }, [saved]);

  const total = useMemo(() => orders.length, [orders.length]);

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-header">
          <div>
            <span className="admin-badge">EBII Admin</span>
            <h1 className="admin-title">Üretim Paneli</h1>
            <p className="admin-subtitle">
              Pending sipariş tasarımlarını buradan görebilirsin.
            </p>
          </div>

          <div className="admin-actions">
            <button className="admin-btn secondary" onClick={() => loadOrders()}>
              Yenile
            </button>
            <button className="admin-btn secondary" onClick={handleClearKey}>
              Anahtarı Temizle
            </button>
          </div>
        </div>

        <div className="admin-auth-card">
          <label className="admin-label">Admin anahtarı</label>
          <div className="admin-auth-row">
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="ADMIN_ACCESS_KEY"
              className="admin-input"
            />
            <button className="admin-btn primary" onClick={handleSaveKey}>
              Kaydet
            </button>
          </div>
        </div>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Pending kayıt</span>
            <strong className="admin-stat-value">{total}</strong>
          </div>
        </div>

        {loading && <p className="admin-info">Siparişler yükleniyor...</p>}
        {error && <p className="admin-error">{error}</p>}

        <div className="admin-grid">
          {orders.map((order) => (
            <article key={order.designRef} className="admin-order-card">
              <div className="admin-order-preview">
                <img
                  src={order.finalPrintUrl}
                  alt={order.designRef}
                  className="admin-order-image"
                />
              </div>

              <div className="admin-order-body">
                <div className="admin-order-top">
                  <div>
                    <h2 className="admin-order-title">{order.designRef}</h2>
                    <p className="admin-order-date">
                      {new Date(order.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>
                </div>

                <div className="admin-order-meta">
                  <p><strong>Renk:</strong> {order.product.color === "white" ? "Beyaz" : "Siyah"}</p>
                  <p><strong>Yüz:</strong> {order.product.side === "front" ? "Ön" : "Arka"}</p>
                  <p><strong>Beden:</strong> {order.product.size}</p>
                  <p><strong>Adet:</strong> {order.product.quantity}</p>
                  <p><strong>Arka plan:</strong> {order.bgRemoved ? "Kaldırılmış" : "Orijinal"}</p>
                  {order.textLayer.text ? (
                    <p><strong>Yazı:</strong> {order.textLayer.text}</p>
                  ) : (
                    <p><strong>Yazı:</strong> Yok</p>
                  )}
                  {order.product.note ? (
                    <p><strong>Not:</strong> {order.product.note}</p>
                  ) : (
                    <p><strong>Not:</strong> Yok</p>
                  )}
                </div>

                <div className="admin-order-links">
                  <a
                    href={order.finalPrintUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn primary"
                  >
                    Final baskıyı aç
                  </a>

                  <a
                    href={order.rawDesignUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn secondary"
                  >
                    Ham tasarımı aç
                  </a>

                  <a
                    href={order.jsonUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn secondary"
                  >
                    JSON kaydını aç
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background: radial-gradient(circle at top, #171926 0%, #0b0b0f 45%);
          color: #f5f7fb;
          padding: 24px;
        }

        .admin-shell {
          max-width: 1280px;
          margin: 0 auto;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        }

        .admin-badge {
          display: inline-flex;
          padding: 6px 10px;
          font-size: 12px;
          border-radius: 999px;
          background: #1b2030;
          border: 1px solid #2a3042;
          color: #c6cede;
          margin-bottom: 12px;
        }

        .admin-title {
          margin: 0;
          font-size: 36px;
          font-weight: 900;
        }

        .admin-subtitle {
          margin-top: 8px;
          color: #a8b0c2;
        }

        .admin-actions,
        .admin-auth-row,
        .admin-order-links {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .admin-auth-card,
        .admin-stat-card,
        .admin-order-card {
          background: rgba(18, 19, 26, 0.92);
          border: 1px solid #232633;
          border-radius: 24px;
        }

        .admin-auth-card {
          padding: 20px;
          margin-bottom: 20px;
        }

        .admin-label {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .admin-input {
          flex: 1;
          min-width: 260px;
          border-radius: 14px;
          background: #10131c;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 14px;
          color: white;
        }

        .admin-btn {
          border: 0;
          border-radius: 14px;
          padding: 12px 16px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .admin-btn.primary {
          background: white;
          color: black;
        }

        .admin-btn.secondary {
          background: #1a1d28;
          color: white;
          border: 1px solid #2a2f3d;
        }

        .admin-stats {
          margin-bottom: 20px;
        }

        .admin-stat-card {
          padding: 18px 20px;
          max-width: 220px;
        }

        .admin-stat-label {
          display: block;
          color: #a8b0c2;
          font-size: 13px;
        }

        .admin-stat-value {
          display: block;
          margin-top: 8px;
          font-size: 28px;
        }

        .admin-info {
          color: #a8b0c2;
        }

        .admin-error {
          color: #ff9b9b;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .admin-order-card {
          overflow: hidden;
        }

        .admin-order-preview {
          background: #f5f5f5;
          padding: 18px;
        }

        .admin-order-image {
          display: block;
          width: 100%;
          max-height: 520px;
          object-fit: contain;
          margin: 0 auto;
        }

        .admin-order-body {
          padding: 20px;
        }

        .admin-order-title {
          margin: 0;
          font-size: 22px;
        }

        .admin-order-date {
          margin-top: 6px;
          color: #a8b0c2;
          font-size: 14px;
        }

        .admin-order-meta {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px 16px;
        }

        .admin-order-meta p {
          margin: 0;
          color: #d7dceb;
          line-height: 1.5;
        }

        .admin-order-links {
          margin-top: 18px;
        }

        @media (max-width: 900px) {
          .admin-grid {
            grid-template-columns: 1fr;
          }

          .admin-header {
            flex-direction: column;
          }

          .admin-order-meta {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}