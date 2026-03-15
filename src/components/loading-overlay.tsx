"use client";

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
};

export default function LoadingOverlay({
  visible,
  title = "Tasarlanıyor...",
  subtitle = "Lütfen bekleyin, görselleriniz hazırlanıyor."
}: Props) {
  if (!visible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="spinner" />
        <h2 className="loading-title">{title}</h2>
        <p className="loading-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}