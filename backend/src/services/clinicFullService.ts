import { supabase } from "../supabaseClient";

/**
 * Busca todos os dados da clínica, incluindo latitude/longitude corretamente como number.
 */
export async function getFullClinicById(id: string | number) {
  // Busca clinic
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select(
      "id, name, email, specialties, custom_specialties, created_at, featured, isnew, image"
    )
    .eq("id", id)
    .maybeSingle();

  if (clinicError) throw clinicError;
  if (!clinic) return null;

  // Busca settings
  const { data: settings, error: settingsError } = await supabase
    .from("clinic_settings")
    .select("*")
    .eq("clinic_id", id)
    .maybeSingle();
  if (settingsError) throw settingsError;

  // Busca professionals
  const { data: professionals, error: profError } = await supabase
    .from("professionals")
    .select("id, name, specialty, photo")
    .eq("clinic_id", id);
  if (profError) throw profError;

  // Busca services
  const { data: services, error: servError } = await supabase
    .from("services")
    .select("id, name, duration, description, price, value")
    .eq("clinic_id", id);
  if (servError) throw servError;

  // Busca reviews
  let reviews: any[] = [];
  try {
    const { data: reviewsArr, error: reviewsError } = await supabase
      .from("reviews")
      .select("id, user_name, rating, date, comment")
      .eq("clinic_id", id);
    if (reviewsError) throw reviewsError;
    reviews = reviewsArr || [];
  } catch {}

  // Galeria
  let gallery: string[] = [];
  if (settings?.gallery_image_urls) {
    try {
      gallery = Array.isArray(settings.gallery_image_urls)
        ? settings.gallery_image_urls
        : JSON.parse(settings.gallery_image_urls);
    } catch {
      gallery = [];
    }
  }

  // Garante sempre string JSON
  let openingHours: string = "";
  if (settings && settings.opening_hours !== undefined && settings.opening_hours !== null) {
    try {
      openingHours =
        typeof settings.opening_hours === "string"
          ? settings.opening_hours
          : JSON.stringify(settings.opening_hours);
    } catch {
      openingHours = "";
    }
  } else {
    openingHours = "";
  }

  const today = new Date();
  const availableDates: string[] = [];
  const availableTimes: { [date: string]: string[] } = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    availableDates.push(dateStr);
    availableTimes[dateStr] = ["09:00", "10:00", "11:00", "14:00", "15:00"];
  }

  // Conversão robusta para number ou null (mesmo se vier string do banco)
  const latitude =
    settings && settings.latitude !== undefined && settings.latitude !== null && settings.latitude !== ""
      ? Number(settings.latitude)
      : null;
  const longitude =
    settings && settings.longitude !== undefined && settings.longitude !== null && settings.longitude !== ""
      ? Number(settings.longitude)
      : null;
  const latitude_map =
    settings && settings.latitude_map !== undefined && settings.latitude_map !== null && settings.latitude_map !== ""
      ? Number(settings.latitude_map)
      : null;
  const longitude_map =
    settings && settings.longitude_map !== undefined && settings.longitude_map !== null && settings.longitude_map !== ""
      ? Number(settings.longitude_map)
      : null;
  const latitude_address =
    settings && settings.latitude_address !== undefined && settings.latitude_address !== null && settings.latitude_address !== ""
      ? Number(settings.latitude_address)
      : null;
  const longitude_address =
    settings && settings.longitude_address !== undefined && settings.longitude_address !== null && settings.longitude_address !== ""
      ? Number(settings.longitude_address)
      : null;

  // Utilitário para pegar valor do settings se não for string vazia, senão pega do fallback
  function pickSetting(settingVal: any, fallbackVal: any) {
    if (typeof settingVal === "string") {
      return settingVal.trim() !== "" ? settingVal : fallbackVal;
    }
    return settingVal !== undefined && settingVal !== null ? settingVal : fallbackVal;
  }

  return {
    id: clinic.id,
    name: pickSetting(settings?.name, clinic.name),
    email: pickSetting(settings?.email, clinic.email),
    specialties: clinic.specialties ? JSON.parse(clinic.specialties) : [],
    customSpecialties: clinic.custom_specialties
      ? JSON.parse(clinic.custom_specialties)
      : [],
    description: pickSetting(settings?.description, ""),
    // ENDEREÇO SEPARADO
    street: pickSetting(settings?.street, ""),
    number: pickSetting(settings?.number, ""),
    neighborhood: pickSetting(settings?.neighborhood, ""),
    city: pickSetting(settings?.city, ""),
    state: pickSetting(settings?.state, ""),
    cep: pickSetting(settings?.cep, ""),
    latitude,
    longitude,
    latitude_map,
    longitude_map,
    latitude_address,
    longitude_address,
    address: [
      pickSetting(settings?.street, ""),
      pickSetting(settings?.number, ""),
      pickSetting(settings?.neighborhood, ""),
      pickSetting(settings?.city, ""),
      pickSetting(settings?.state, ""),
      pickSetting(settings?.cep, ""),
    ]
      .filter(Boolean)
      .join(", "),
    phone: pickSetting(settings?.phone, ""),
    openingHours, // <--- sempre string JSON
    coverUrl: pickSetting(settings?.cover_image_url, clinic.image || ""),
    galleryUrls: gallery,
    website: pickSetting(settings?.website, ""),
    professionals,
    services,
    availableDates,
    availableTimes,
    reviews: reviews.map((r) => ({
      id: r.id,
      userName: r.user_name,
      rating: r.rating,
      date: r.date,
      comment: r.comment,
    })),
    reviewCount: reviews.length,
    rating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
          ).toFixed(1)
        : null,
    featured: clinic.featured,
    isNew: clinic.isnew,
    createdAt: clinic.created_at,
  };
}

/**
 * Atualiza os dados da clínica, incluindo latitude/longitude como number.
 * Aceita files para upload/multipart.
 */
export async function updateClinicSettings(
  clinicId: string | number,
  data: any,
  files?: any
) {
  const updateData: Record<string, any> = {};

  // Campos válidos
  const fields = [
    "name", "email", "phone", "description", "website",
    "openingHours", "coverUrl", "galleryUrls",
    "street", "number", "neighborhood", "city", "state", "cep",
    "latitude", "longitude",
    "latitude_map", "longitude_map", "latitude_address", "longitude_address"
  ];

  fields.forEach(field => {
    if (field in data) {
      // Mapear nomes de campos conforme banco
      if (field === "coverUrl") {
        updateData.cover_image_url = data.coverUrl;
      } else if (field === "galleryUrls") {
        updateData.gallery_image_urls = Array.isArray(data.galleryUrls)
          ? JSON.stringify(data.galleryUrls)
          : data.galleryUrls;
      } else if (field === "openingHours") {
        if (typeof data.openingHours === "string") {
          try {
            JSON.parse(data.openingHours);
            updateData.opening_hours = data.openingHours;
          } catch {
            updateData.opening_hours = JSON.stringify(data.openingHours);
          }
        } else if (typeof data.openingHours === "object" && data.openingHours !== null) {
          updateData.opening_hours = JSON.stringify(data.openingHours);
        } else {
          updateData.opening_hours = "";
        }
      } else if (field === "latitude") {
        updateData.latitude =
          data.latitude !== null && data.latitude !== undefined && data.latitude !== ""
            ? Number(data.latitude)
            : null;
      } else if (field === "longitude") {
        updateData.longitude =
          data.longitude !== null && data.longitude !== undefined && data.longitude !== ""
            ? Number(data.longitude)
            : null;
      } else if (field === "latitude_map") {
        updateData.latitude_map =
          data.latitude_map !== null && data.latitude_map !== undefined && data.latitude_map !== ""
            ? Number(data.latitude_map)
            : null;
      } else if (field === "longitude_map") {
        updateData.longitude_map =
          data.longitude_map !== null && data.longitude_map !== undefined && data.longitude_map !== ""
            ? Number(data.longitude_map)
            : null;
      } else if (field === "latitude_address") {
        updateData.latitude_address =
          data.latitude_address !== null && data.latitude_address !== undefined && data.latitude_address !== ""
            ? Number(data.latitude_address)
            : null;
      } else if (field === "longitude_address") {
        updateData.longitude_address =
          data.longitude_address !== null && data.longitude_address !== undefined && data.longitude_address !== ""
            ? Number(data.longitude_address)
            : null;
      } else {
        updateData[field] = data[field];
      }
    }
  });

  // Se veio imagem de capa pelo Multer, sobrescreva
  if (files && files.coverImage && files.coverImage.length > 0) {
    const file = files.coverImage[0];
    updateData.cover_image_url = file.filename;
  }

  // Se vieram imagens de galeria pelo Multer, adicione/concatene corretamente
  if (files && files.galleryImages && files.galleryImages.length > 0) {
    let currentGallery: string[] = [];
    if (data.galleryUrls) {
      try {
        currentGallery = Array.isArray(data.galleryUrls)
          ? data.galleryUrls
          : JSON.parse(data.galleryUrls);
      } catch {
        currentGallery = [];
      }
    }
    const newImages = files.galleryImages.map((file: any) => file.filename);
    const finalGallery = [...currentGallery, ...newImages];
    updateData.gallery_image_urls = JSON.stringify(finalGallery);
  } else if (data.galleryUrls) {
    try {
      updateData.gallery_image_urls = Array.isArray(data.galleryUrls)
        ? JSON.stringify(data.galleryUrls)
        : data.galleryUrls;
    } catch {
      updateData.gallery_image_urls = "[]";
    }
  }

  // Atualiza no Supabase
  const { error } = await supabase
    .from("clinic_settings")
    .update(updateData)
    .eq("clinic_id", clinicId);
  if (error) throw error;

  return getFullClinicById(clinicId);
}