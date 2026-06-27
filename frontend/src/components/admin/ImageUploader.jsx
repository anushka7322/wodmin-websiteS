import { useRef, useState } from "react";
import axios from "axios";
import { Upload, X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { API, getToken } from "@/lib/api";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * ImageUploader — uploads to /api/admin/uploads and returns hosted URLs.
 *
 * Props:
 *   value       — string (single mode) or string[] (multi mode) of URLs
 *   onChange    — (newValue) => void
 *   multiple    — boolean (default false)
 *   max         — when multiple, the upper bound (default 8)
 */
export default function ImageUploader({ value, onChange, multiple = false, max = 8 }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const list = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []);

  const triggerPick = () => inputRef.current?.click();

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    const valid = Array.from(files).filter((f) => {
      if (!ACCEPT.split(",").includes(f.type)) {
        toast.error(`Skipped ${f.name}: unsupported type`); return false;
      }
      if (f.size > MAX_BYTES) {
        toast.error(`Skipped ${f.name}: larger than 8 MB`); return false;
      }
      return true;
    });
    if (!valid.length) return;
    setBusy(true);
    try {
      const uploaded = [];
      for (const f of valid) {
        const fd = new FormData();
        fd.append("file", f);
        const r = await axios.post(`${API}/admin/uploads`, fd, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        uploaded.push(r.data.url);
      }
      if (multiple) {
        const next = [...list, ...uploaded].slice(0, max);
        onChange(next);
      } else {
        onChange(uploaded[0]);
      }
      toast.success(`${uploaded.length} image${uploaded.length === 1 ? "" : "s"} uploaded`);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (idx) => {
    if (multiple) {
      const next = list.filter((_, i) => i !== idx);
      onChange(next);
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-2" data-testid="image-uploader">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        data-testid="image-uploader-input"
      />

      {list.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {list.map((url, i) => (
            <div key={url + i} className="group relative aspect-square overflow-hidden rounded-xl border border-brand-line bg-brand-sand">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded-full bg-white/95 p-1 text-brand-walnut shadow-sm hover:text-brand-terracotta"
                data-testid={`image-uploader-remove-${i}`}
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={triggerPick}
        disabled={busy || (multiple && list.length >= max)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-line bg-brand-cream px-4 py-3 text-sm text-brand-mocha transition hover:border-brand-terracotta hover:text-brand-terracotta disabled:opacity-50"
        data-testid="image-uploader-trigger"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : list.length === 0 ? <ImagePlus className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        {busy ? "Uploading…" : list.length === 0 ? "Upload image" : multiple ? `Add more (${list.length}/${max})` : "Replace image"}
      </button>
      <p className="text-[11px] text-brand-mocha">JPG, PNG, WebP or GIF · max 8 MB each</p>
    </div>
  );
}
