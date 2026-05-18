import { requireSupabase } from "./supabase";

export type Bucket =
  | "product-images"
  | "collection-images"
  | "page-images"
  | "blog-images"
  | "product-downloads";

function randId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function uploadImage(file: File, bucket: Bucket, prefix = ""): Promise<string> {
  const sb = requireSupabase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safe = (prefix ? `${prefix}/` : "") + `${Date.now()}-${randId()}.${ext}`;
  const { error } = await sb.storage.from(bucket).upload(safe, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  const { data } = sb.storage.from(bucket).getPublicUrl(safe);
  return data.publicUrl;
}

export async function uploadImages(files: FileList | File[], bucket: Bucket, prefix = ""): Promise<string[]> {
  const arr = Array.from(files);
  return Promise.all(arr.map((f) => uploadImage(f, bucket, prefix)));
}

/** Generic uploader for non-image files (PDFs, zip, audio, etc). */
export async function uploadFile(file: File, bucket: Bucket, prefix = ""): Promise<string> {
  const sb = requireSupabase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const safe = (prefix ? `${prefix}/` : "") + `${Date.now()}-${randId()}.${ext}`;
  const { error } = await sb.storage.from(bucket).upload(safe, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;
  const { data } = sb.storage.from(bucket).getPublicUrl(safe);
  return data.publicUrl;
}

/** Best-effort delete by public URL. Silently ignores failures. */
export async function deleteByPublicUrl(url: string, bucket: Bucket): Promise<void> {
  try {
    const sb = requireSupabase();
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx < 0) return;
    const path = url.slice(idx + marker.length);
    await sb.storage.from(bucket).remove([path]);
  } catch {
    // ignore
  }
}
