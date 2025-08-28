import type { Professional } from "@/components/ClinicAdminPanel_Managers/types";
import { resolveImageUrl } from "@/utils/resolveImage";

export function normalizeProfessional(raw: any): Professional {
  const id = Number(raw.id);
  const active = raw.active === false ? false : true;
  const specialty = String(raw.specialty ?? raw.speciality ?? "").trim();

  const base: Professional = {
    id,
    name: String(raw.name ?? "").trim(),
    specialty,
    photo: String(raw.photo ?? ""),
    available: !!(raw.available ?? raw.isAvailable ?? true),
    clinic_id: raw.clinic_id ?? raw.clinicId,
    clinicId: raw.clinicId ?? raw.clinic_id,
    email: raw.email,
    phone: raw.phone,
    resume: raw.resume,
    color: raw.color,
    active,
    deleted_at: raw.deleted_at ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    createdAt: raw.createdAt ?? raw.created_at,
    updatedAt: raw.updatedAt ?? raw.updated_at,
    isInactive: active === false,
    photoUrl: resolveImageUrl(raw.photo),
    displayName: active === false
      ? `${String(raw.name ?? "").trim()} (Inativo)`
      : String(raw.name ?? "").trim(),
  };

  return base;
}

export function normalizeProfessionals(list: any[]): Professional[] {
  return (list || []).map(normalizeProfessional);
}