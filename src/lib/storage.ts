// =============================================================================
// Supabase Storage helpers for Phase 13.
// -----------------------------------------------------------------------------
// Buckets:
//   admin-creatives      → admin-managed library images (read: any auth)
//   generated-creatives  → partner Rebrand Studio exports ({uid}/file.ext)
//   partner-logos        → partner branding ({uid}/logo.ext)
// Buckets are private; we return signed URLs (1-year) for image_url fields.
// =============================================================================

import { supabase } from "@/integrations/supabase/client";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

function extFromFile(file: File | Blob): string {
  const name = (file as File).name ?? "";
  const m = /\.([a-z0-9]+)$/i.exec(name);
  if (m) return m[1].toLowerCase();
  const type = (file.type ?? "").split("/")[1];
  return (type || "png").toLowerCase();
}

async function uploadAndSign(
  bucket: string,
  path: string,
  data: File | Blob,
  contentType?: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, data, {
      upsert: true,
      contentType: contentType ?? (data as File).type ?? undefined,
    });
  if (error) throw error;
  const { data: signed, error: sErr } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (sErr || !signed) throw sErr ?? new Error("createSignedUrl failed");
  return signed.signedUrl;
}

export async function uploadAdminCreative(file: File): Promise<string> {
  const ext = extFromFile(file);
  const path = `${crypto.randomUUID()}.${ext}`;
  return uploadAndSign("admin-creatives", path, file);
}

export async function uploadGeneratedCreative(
  userId: string,
  blob: Blob,
  ext = "png",
): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  return uploadAndSign("generated-creatives", path, blob, `image/${ext}`);
}

export async function uploadPartnerLogo(userId: string, file: File): Promise<string> {
  const ext = extFromFile(file);
  const path = `${userId}/logo-${Date.now()}.${ext}`;
  return uploadAndSign("partner-logos", path, file);
}
