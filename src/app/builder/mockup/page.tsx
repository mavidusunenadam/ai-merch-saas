"use client";

import { useEffect, useState } from "react";
import { fetchWithActiveShop } from "@/lib/fetch-with-shop";

type SessionData = {
  id: string;
  finalImageUrl: string | null;
  selectedResultId: string | null;
  status: string;
};

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

export default function MockupPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [productTemplate, setProductTemplate] = useState<ProductTemplate | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [preparingCart, setPreparingCart] = useState(false);
  const [cartPayload, setCartPayload] = useState<any | null>(null);
  const [sendingToCart, setSendingToCart] = useState(false);
  const [sendCartMessage, setSendCartMessage] = useState("");
  const [cartRedirectUrl, setCartRedirectUrl] = useState<string | null>(null);

  const fetchSession = async (id: string) => {
    try {
      setLoading(true);

      const res = await fetchWithActiveShop(
        `/api/builder/final-session?sessionId=${id}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load session");
      }

      setSession(data.session);
      setProductTemplate(data.productTemplate || null);
    } catch (error) {
      console.error(error);
      setSession(null);
      setProductTemplate(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedSessionId = window.localStorage.getItem("latestBuilderSessionId");

    if (savedSessionId) {
      setSessionId(savedSessionId);
      fetchSession(savedSessionId);
    } else {
      setLoading(false);
    }

    const savedCartPayload = window.localStorage.getItem("latestCartPayload");
    if (savedCartPayload) {
      try {
        setCartPayload(JSON.parse(savedCartPayload));
      } catch (error) {
        console.error("Failed to parse saved cart payload:", error);
      }
    }
  }, []);

  const handlePrepareCart = async () => {
    try {
      if (!session?.id) {
        alert("No session found.");
        return;
      }

      setPreparingCart(true);
      setCartMessage("");

      const res = await fetchWithActiveShop("/api/builder/prepare-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to prepare cart");
      }

      setCartPayload(data.cartPayload);
      setCartMessage("Cart payload prepared successfully.");
      window.localStorage.setItem(
        "latestCartPayload",
        JSON.stringify(data.cartPayload)
      );

      if (data.session?.id) {
        setSession((prev) =>
          prev
            ? {
                ...prev,
                status: data.session.status ?? prev.status,
              }
            : prev
        );
      }
    } catch (error) {
      console.error(error);
      setCartMessage("Failed to prepare cart payload.");
    } finally {
      setPreparingCart(false);
    }
  };

  const handleSendToCart = async () => {
    try {
      if (!session?.id) {
        alert("No session found.");
        return;
      }

      setSendingToCart(true);
      setSendCartMessage("");
      setCartRedirectUrl(null);

      const res = await fetchWithActiveShop("/api/builder/send-to-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: session.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send to cart");
      }

      setSendCartMessage(data.message || "Cart is ready.");
      setCartRedirectUrl(data.redirectUrl || null);

      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: "sent_to_cart",
            }
          : prev
      );
    } catch (error) {
      console.error(error);
      setSendCartMessage("Failed to send cart.");
    } finally {
      setSendingToCart(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <div className="card">Loading mockup...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Mockup Preview</h1>
          <p className="page-subtitle">
            Review the selected result on the merchant’s chosen product template.
          </p>
        </div>

        {!sessionId && (
          <div className="status-box mb-6">
            No session found in localStorage yet.
          </div>
        )}

        {session?.finalImageUrl ? (
          <>
            <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="card">
                <div className="mb-5">
                  <h2 className="section-title">
                    {productTemplate ? productTemplate.name : "Product Mockup"}
                  </h2>
                  <p className="muted-text mt-2">
                    Live preview of the final design positioned inside the product print area.
                  </p>
                </div>

                <div className="flex items-center justify-center rounded-2xl bg-gray-100 p-6 md:p-8">
                  <div className="relative h-[520px] w-[400px] overflow-hidden rounded-[40px] bg-white shadow-md">
                    <div className="absolute left-1/2 top-[70px] h-[80px] w-[140px] -translate-x-1/2 rounded-b-[50px] border border-gray-200 bg-gray-50" />
                    <div className="absolute left-[-35px] top-[95px] h-[160px] w-[70px] rounded-l-[40px] border border-gray-200 bg-white" />
                    <div className="absolute right-[-35px] top-[95px] h-[160px] w-[70px] rounded-r-[40px] border border-gray-200 bg-white" />

                    {productTemplate ? (
                      <div
                        className="absolute flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50"
                        style={{
                          left: `${productTemplate.printAreaX}px`,
                          top: `${productTemplate.printAreaY}px`,
                          width: `${productTemplate.printAreaWidth}px`,
                          height: `${productTemplate.printAreaHeight}px`,
                        }}
                      >
                        <img
                          src={session.finalImageUrl}
                          alt="Final design"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="absolute left-[90px] top-[140px] flex h-[220px] w-[220px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50">
                        <img
                          src={session.finalImageUrl}
                          alt="Final design"
                          className="max-h-[200px] max-w-[200px] object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="card">
                  <h2 className="section-title">Selection Details</h2>

                  <div className="mt-5 space-y-4">
                    <div className="status-box">
                      <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                        Session ID
                      </span>
                      <span className="mt-1 block break-all font-semibold text-gray-900">
                        {session.id}
                      </span>
                    </div>

                    <div className="status-box">
                      <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                        Status
                      </span>
                      <span className="mt-1 block font-semibold text-gray-900">
                        {session.status}
                      </span>
                    </div>

                    <div className="status-box">
                      <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                        Selected Result ID
                      </span>
                      <span className="mt-1 block break-all font-semibold text-gray-900">
                        {session.selectedResultId}
                      </span>
                    </div>

                    <div className="status-box">
                      <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                        Product
                      </span>
                      <span className="mt-1 block font-semibold text-gray-900">
                        {productTemplate ? productTemplate.name : "No product selected"}
                      </span>
                    </div>

                    {productTemplate && (
                      <div className="status-box">
                        <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                          Print Area
                        </span>
                        <span className="mt-1 block font-semibold text-gray-900">
                          {productTemplate.printAreaWidth} × {productTemplate.printAreaHeight}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h2 className="section-title">Final Design</h2>

                  <div className="mt-5 rounded-2xl bg-gray-100 p-4">
                    <img
                      src={session.finalImageUrl}
                      alt="Final selected design"
                      className="max-h-[320px] rounded-xl object-contain"
                    />
                  </div>
                </div>

                <div className="card">
                  <h2 className="section-title">Cart Actions</h2>
                  <p className="muted-text mt-2">
                    Prepare the Shopify-ready cart payload, then send it to the cart flow.
                  </p>

                  <div className="mt-5 flex flex-col gap-3">
                    <button
                      onClick={handlePrepareCart}
                      disabled={preparingCart || !session?.finalImageUrl}
                      className="btn-primary"
                    >
                      {preparingCart ? "Preparing..." : "Prepare Add to Cart"}
                    </button>

                    {cartMessage && <div className="status-box">{cartMessage}</div>}

                    <button
                      onClick={handleSendToCart}
                      disabled={sendingToCart || !cartPayload}
                      className="btn-secondary"
                    >
                      {sendingToCart ? "Sending..." : "Send to Shopify Cart"}
                    </button>

                    {sendCartMessage && (
                      <div className="status-box">{sendCartMessage}</div>
                    )}

                    {cartRedirectUrl && (
                      <div className="status-box">
                        <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                          Cart URL
                        </span>
                        <span className="mt-1 block break-all text-sm text-gray-700">
                          {cartRedirectUrl}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {cartPayload && (
              <div className="card mt-8">
                <h2 className="section-title">Cart Payload Preview</h2>
                <p className="muted-text mt-2">
                  Debug view of the prepared Shopify cart payload.
                </p>

                <pre className="mt-5 overflow-auto rounded-2xl bg-gray-100 p-4 text-xs text-gray-700">
                  {JSON.stringify(cartPayload, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="card border-red-200 bg-red-50">
            <h2 className="section-title">No final design available</h2>
            <p className="mt-3 text-sm text-red-700">
              No final selected design was found for this session.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
