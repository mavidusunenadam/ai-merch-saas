"use client";

type Props = {
  preview: string;
  loading: boolean;
  error: string;
  onFileChange: (file: File | null) => void;
  onGenerate: () => void;
};

export default function StepUpload({
  preview,
  loading,
  error,
  onFileChange,
  onGenerate
}: Props) {
  return (
    <div className="card card-pad">
      <div>
        <div>
          <span className="badge">1. Adım</span>
          <h2 className="section-title">Fotoğrafını yükle</h2>
          <p className="section-text">
            Tek yüklemede 4 farklı stil üretilecek: Rockwell, Ghibli, Anime, Karikatür.
          </p>
        </div>

        <div className="mt-6">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="input-file"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          />
        </div>

        {preview && (
          <div className="card card-pad mt-6">
            <p className="text-sm text-gray mb-3">Yüklenen görsel</p>
            <img
              src={preview}
              alt="Preview"
              className="result-image preview-image"
            />
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Tasarım Üretiliyor..." : "Tasarım Oluştur"}
          </button>
        </div>

        {error && (
          <div className="card card-pad mt-6">
            <p className="text-danger">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}