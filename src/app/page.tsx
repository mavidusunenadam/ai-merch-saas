"use client";

import { useMemo, useState } from "react";
import LoadingOverlay from "@/components/loading-overlay";
import NavigationButtons from "@/components/navigation-buttons";
import Stepper from "@/components/stepper";
import StepMockup from "@/components/steps/step-mockup";
import StepProduct from "@/components/steps/step-product";
import StepSelectDesign from "@/components/steps/step-select-design";
import StepSummary from "@/components/steps/step-summary";
import StepUpload from "@/components/steps/step-upload";
import { renderFinalPrintPng } from "@/lib/export-design";
import {
  DesignPlacement,
  GenerateStylesResponse,
  ProductSelection,
  StepKey,
  StyleResult,
  TextLayer
} from "@/lib/types";

async function compressImage(file: File): Promise<File> {
  const imageBitmap = await createImageBitmap(file);

  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / imageBitmap.width);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(imageBitmap.width * scale);
  canvas.height = Math.round(imageBitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context bulunamadı.");

  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });

  if (!blob) throw new Error("Görsel sıkıştırılamadı.");

  return new File([blob], "upload.jpg", { type: "image/jpeg" });
}

const initialProduct: ProductSelection = {
  color: "white",
  side: "front",
  size: "M",
  quantity: 1,
  note: ""
};

const initialPlacement: DesignPlacement = {
  x: 50,
  y: 34,
  width: 34
};

const initialTextLayer: TextLayer = {
  text: "",
  x: 50,
  y: 70,
  fontSize: 28,
  color: "#ffffff"
};

export default function HomePage() {
  const [step, setStep] = useState<StepKey>(1);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [useOriginalImage, setUseOriginalImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [backgroundRemoving, setBackgroundRemoving] = useState(false);
  const [cartCreating, setCartCreating] = useState(false);

  const [error, setError] = useState("");
  const [designs, setDesigns] = useState<StyleResult[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<StyleResult | null>(null);
  const [bgRemovedUrl, setBgRemovedUrl] = useState("");

  const [product, setProduct] = useState<ProductSelection>(initialProduct);
  const [placement, setPlacement] = useState<DesignPlacement>(initialPlacement);
  const [textLayer, setTextLayer] = useState<TextLayer>(initialTextLayer);

  const activeDesignUrl =
    bgRemovedUrl ||
    (useOriginalImage ? originalImageUrl : selectedDesign?.url) ||
    null;

  const canGoNext = useMemo(() => {
    if (step === 1) return designs.length > 0 || !!originalImageUrl;
    if (step === 2) return !!selectedDesign || !!originalImageUrl;
    if (step === 3) return !!activeDesignUrl;
    if (step === 4) return !!activeDesignUrl && product.quantity > 0;
    return true;
  }, [step, designs.length, selectedDesign, originalImageUrl, activeDesignUrl, product.quantity]);

  function handleFileChange(selected: File | null) {
    setFile(selected);
    setDesigns([]);
    setSelectedDesign(null);
    setBgRemovedUrl("");
    setUseOriginalImage(false);
    setError("");

    if (selected) {
      const previewUrl = URL.createObjectURL(selected);
      setUploadedPreview(previewUrl);
      setOriginalImageUrl(previewUrl);
    } else {
      setUploadedPreview("");
      setOriginalImageUrl("");
    }
  }

  async function handleGenerate() {
    if (!file) {
      setError("Lütfen bir fotoğraf seç.");
      return;
    }

    setLoading(true);
    setError("");
    setDesigns([]);
    setSelectedDesign(null);
    setBgRemovedUrl("");
    setUseOriginalImage(false);

    try {
      const optimized = await compressImage(file);

      const formData = new FormData();
      formData.append("file", optimized);

      const res = await fetch("/api/generate-styles", {
        method: "POST",
        body: formData
      });

      const json: GenerateStylesResponse = await res.json();

      if (!res.ok || !json.success || !json.results) {
        throw new Error(json.error || "Bir hata oluştu.");
      }

      setDesigns(json.results);
      setSelectedDesign(json.results[0] || null);
      setPlacement(initialPlacement);
      setTextLayer(initialTextLayer);
      setProduct(initialProduct);
      setStep(2);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleUseOriginalImage() {
    if (!originalImageUrl) return;

    setUseOriginalImage(true);
    setSelectedDesign(null);
    setBgRemovedUrl("");
    setPlacement(initialPlacement);
    setTextLayer(initialTextLayer);
    setStep(3);
  }

  function handleNext() {
    if (step < 5 && canGoNext) {
      setStep((prev) => (prev + 1) as StepKey);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep((prev) => (prev - 1) as StepKey);
    }
  }

  function updateProduct(updates: Partial<ProductSelection>) {
    setProduct((prev) => ({
      ...prev,
      ...updates
    }));
  }

 async function handleRemoveBackground() {
  try {
    setBackgroundRemoving(true);

    let res: Response;

    if (useOriginalImage && file) {
      const formData = new FormData();
      formData.append("file", file);

      res = await fetch("/api/remove-background", {
        method: "POST",
        body: formData
      });
    } else {
      if (!activeDesignUrl) {
        throw new Error("Arka plan kaldırılacak görsel bulunamadı.");
      }

      res = await fetch("/api/remove-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          imageUrl: activeDesignUrl
        })
      });
    }

    const json = await res.json();

    if (!res.ok || !json.success || !json.url) {
      throw new Error(json.error || "Arka plan kaldırma başarısız.");
    }

    setBgRemovedUrl(json.url);
  } catch (err) {
    alert(err instanceof Error ? err.message : "Arka plan kaldırma hatası.");
  } finally {
    setBackgroundRemoving(false);
  }
}

  function handleUseOriginal() {
    setBgRemovedUrl("");
  }

  async function handleAddToCart() {
    if (!activeDesignUrl) {
      alert("Önce bir tasarım seçmelisin.");
      return;
    }

    try {
      setCartCreating(true);

      const finalPrintDataUrl = await renderFinalPrintPng({
        designUrl: activeDesignUrl,
        placement,
        textLayer
      });

      const exportRes = await fetch("/api/save-design-output", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rawDesignUrl: activeDesignUrl,
          finalPrintDataUrl
        })
      });

      const exportJson = await exportRes.json();

      if (!exportRes.ok || !exportJson.success) {
        throw new Error(exportJson.error || "Çıktılar kaydedilemedi.");
      }

      const cartRes = await fetch("/api/shopify/create-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          product,
          rawDesignUrl: exportJson.rawDesignUrl,
          finalPrintUrl: exportJson.finalPrintUrl,
          textLayer,
          placement,
          bgRemoved: !!bgRemovedUrl
        })
      });

      const cartJson = await cartRes.json();

      if (!cartRes.ok || !cartJson.success || !cartJson.checkoutUrl) {
        throw new Error(cartJson.error || "Shopify sepet oluşturulamadı. Tekrar deneyiniz.");
      }

      window.location.href = cartJson.checkoutUrl;
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Sepete ekleme sırasında hata oluştu. Tekrar deneyiniz."
      );
    } finally {
      setCartCreating(false);
    }
  }

  const overlayVisible = loading || backgroundRemoving || cartCreating;

  const overlayTitle = cartCreating
    ? "Sepetiniz oluşturuluyor..."
    : backgroundRemoving
    ? "Arka plan kaldırılıyor..."
    : "Oluşturuluyor...";

  const overlaySubtitle = cartCreating
    ? "Lütfen bekleyin, ürününüz sepete ekleniyor."
    : backgroundRemoving
    ? "Görsel şeffaf arka planla hazırlanıyor."
    : "AI görseller hazırlanıyor, lütfen birkaç saniye bekleyin.";

  return (
    <main className="container-app">
      <LoadingOverlay
        visible={overlayVisible}
        title={overlayTitle}
        subtitle={overlaySubtitle}
      />

      <div className="page-shell">
        <div className="hero">
          <span className="badge">ai.ebiidesign.com</span>
          <h1 className="hero-title">
            Fotoğrafını yükle,
            <br />
            AI ile t-shirt’e dönüştür
          </h1>
          <p className="hero-text">
            Kendi tasarımını oluştur, t-shirt üzerinde düzenle ve siparişini oluştur.
          </p>
        </div>

        <Stepper currentStep={step} />

        {step === 1 && (
          <StepUpload
            preview={uploadedPreview}
            loading={loading}
            error={error}
            onFileChange={handleFileChange}
            onGenerate={handleGenerate}
          />
        )}

        {step === 2 && (
          <StepSelectDesign
            designs={designs}
            selectedDesign={selectedDesign}
            originalImageUrl={originalImageUrl}
            onUseOriginalImage={handleUseOriginalImage}
            onSelectDesign={(design) => {
              setSelectedDesign(design);
              setUseOriginalImage(false);
              setBgRemovedUrl("");
            }}
          />
        )}

        {step === 3 && (
          <StepMockup
            designUrl={activeDesignUrl}
            color={product.color}
            side={product.side}
            placement={placement}
            textLayer={textLayer}
            backgroundRemoving={backgroundRemoving}
            usingBgRemoved={!!bgRemovedUrl}
            onColorChange={(color) => updateProduct({ color })}
            onSideChange={(side) => {
              updateProduct({ side });
              setPlacement((prev) => ({
                ...prev,
                y: side === "front" ? 34 : 33
              }));
            }}
            onPlacementChange={setPlacement}
            onTextLayerChange={setTextLayer}
            onRemoveBackground={handleRemoveBackground}
            onUseOriginal={handleUseOriginal}
          />
        )}

        {step === 4 && (
          <StepProduct
            product={product}
            onUpdate={updateProduct}
          />
        )}

        {step === 5 && (
          <StepSummary
            designUrl={activeDesignUrl}
            product={product}
            placement={placement}
            textLayer={textLayer}
            onUpdateProduct={updateProduct}
          />
        )}

        {step < 5 ? (
          <NavigationButtons
            step={step}
            maxStep={5}
            onBack={handleBack}
            onNext={handleNext}
            nextDisabled={!canGoNext}
          />
        ) : (
          <div className="card card-pad mt-6">
            <div className="flex-between">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary"
              >
                Geri
              </button>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary"
              >
                Sepete Ekle
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}