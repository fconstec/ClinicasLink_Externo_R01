import type { Professional } from "@/components/ClinicAdminPanel_Managers/types";
// Se seu alias @ não estiver configurado, troque o import acima para:
// import type { Professional } from "../components/ClinicAdminPanel_Managers/types";
import { resolveImageUrl } from "@/utils/resolveImage";
// Ou relativo: import { resolveImageUrl } from "./resolveImage";

function toBool(val: any): boolean {
  if (typeof val === "boolean") return val;
  if (val === 1 || val === "1") return true;
  if (val === 0 || val === "0") return false;
  if (typeof val === "string") {
    const lowered = val.toLowerCase();
    if (lowered === "true") return true;
    if (lowered === "false") return false;
  }
  return !!val;
}

export function normalizeProfessional(raw: any): Professional & { photoUrl?: string } {
  const p: any = { ...raw };

  if (p.clinic_id && !p.clinicId) p.clinicId = p.clinic_id;
  if (p.clinicId && !p.clinic_id) p.clinic_id = p.clinicId;

  if (typeof p.id === "string") {
    const parsed = parseInt(p.id, 10);
    if (!Number.isNaN(parsed)) p.id = parsed;
  }

  p.name = String(p.name ?? "").trim();
  p.specialty = String(p.specialty ?? p.speciality ?? "").trim();
  p.available = toBool(p.available ?? p.isAvailable);

  const photoCandidate =
    p.photo ||
    p.photoUrl ||
    p.url ||
    p.path ||
    p.fileName ||
    p.filename;

  p.photo = photoCandidate ? String(photoCandidate) : "";
  p.photoUrl = resolveImageUrl(photoCandidate);

  if (p.email !== undefined && p.email !== null) p.email = String(p.email).trim();
  if (p.phone !== undefined && p.phone !== null) p.phone = String(p.phone).trim();
  if (p.resume !== undefined && p.resume !== null) p.resume = String(p.resume);
  if (p.color !== undefined && p.color !== null) p.color = String(p.color);

  return p;
}

export function normalizeProfessionals(list: any[]): (Professional & { photoUrl?: string })[] {
  return (list || []).map(normalizeProfessional);
}