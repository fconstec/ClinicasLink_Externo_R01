import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../supabaseClient";
import { getFullClinicById } from "../services/clinicFullService";

// Cadastro da clínica (inalterado, mantendo estrutura)
export async function registerClinic(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      password,
      specialties,
      customSpecialties,
      featured,
      isNew,
      image,
      latitude,
      longitude,
      street,
      number,
      neighborhood,
      city,
      state,
      cep
    } = req.body;

    if (!name || !email || !password || !specialties || specialties.length === 0) {
      return res.status(400).json({ message: "Dados obrigatórios não preenchidos." });
    }

    const emailNorm = Array.isArray(email) ? email[0] : email;

    const { data: existingArr, error: existingError } = await supabase
      .from("clinics")
      .select("id")
      .eq("email", emailNorm)
      .limit(1);

    if (existingError) throw existingError;
    if (existingArr && Array.isArray(existingArr) && existingArr.length > 0) {
      return res.status(400).json({ message: "E-mail já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertData: any = {
      name,
      email: emailNorm,
      password: hashedPassword,
      specialties: JSON.stringify(specialties),
      custom_specialties: customSpecialties ? JSON.stringify(customSpecialties) : null,
      featured: featured ?? false,
      isnew: isNew ?? true,
      image: image || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const returningFields = [
      "id",
      "name",
      "email",
      "specialties",
      "custom_specialties",
      "created_at",
      "featured",
      "isnew",
      "image"
    ];

    const { data: clinicArr, error: insertError } = await supabase
      .from("clinics")
      .insert([insertData])
      .select(returningFields.join(","));

    if (insertError) throw insertError;

    let clinic: any = null;
    if (Array.isArray(clinicArr) && clinicArr.length > 0) {
      clinic = clinicArr[0];
    } else if (clinicArr && typeof clinicArr === "object") {
      clinic = clinicArr;
    }
    if (!clinic) throw new Error("Falha ao criar clínica.");

    const { error: settingsError } = await supabase.from("clinic_settings").insert([
      {
        clinic_id: clinic.id,
        name: clinic.name,
        email: clinic.email,
        phone: "",
        description: "",
        website: "",
        opening_hours: "",
        cover_image_url: null,
        gallery_image_urls: JSON.stringify([]),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        latitude_map: latitude ?? null,
        longitude_map: longitude ?? null,
        latitude_address: latitude ?? null,
        longitude_address: longitude ?? null,
        street: street || "",
        number: number || "",
        neighborhood: neighborhood || "",
        city: city || "",
        state: state || "",
        cep: cep || ""
      }
    ]);
    if (settingsError) throw settingsError;

    res.status(201).json(clinic);
  } catch (error: any) {
    console.error("Erro ao cadastrar clínica:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      cause: {
        code: error?.cause?.code,
        errno: error?.cause?.errno,
        address: error?.cause?.address,
        port: error?.cause?.port
      },
      stack: error?.stack
    });
    res.status(500).json({ message: "Erro ao cadastrar clínica." });
  }
}

// Listagem das clínicas
export async function listClinics(_req: Request, res: Response) {
  try {
    const { data: clinics, error: clinicsError } = await supabase
      .from("clinics")
      .select("id, name, specialties, custom_specialties, created_at, featured, isnew, email, image");
    if (clinicsError) throw clinicsError;

    const { data: settingsArr, error: settingsError } = await supabase
      .from("clinic_settings")
      .select("clinic_id, latitude, longitude, latitude_map, longitude_map, latitude_address, longitude_address, street, number, neighborhood, city, state, cep, cover_image_url");
    if (settingsError) throw settingsError;

    const settingsMap = Object.fromEntries((settingsArr || []).map((s: any) => [s.clinic_id, s]));

    const mergedClinics = (clinics || []).map((clinic: any) => {
      const settings = settingsMap[clinic.id] || {};
      let specialties: any[] = [];
      let customSpecialties: any[] = [];

      try { specialties = clinic.specialties ? JSON.parse(clinic.specialties) : []; } catch { specialties = []; }
      try { customSpecialties = clinic.custom_specialties ? JSON.parse(clinic.custom_specialties) : []; } catch { customSpecialties = []; }

      return {
        id: clinic.id,
        name: clinic.name,
        specialties,
        customSpecialties,
        createdAt: clinic.created_at,
        featured: clinic.featured,
        isNew: clinic.isnew,
        email: clinic.email,
        coverImage: settings.cover_image_url || clinic.image || "",
        address: [settings.street, settings.number, settings.neighborhood, settings.city, settings.state, settings.cep]
          .filter(Boolean).join(", "),
        settings: {
          latitude: settings.latitude ?? null,
          longitude: settings.longitude ?? null,
          latitude_map: settings.latitude_map ?? null,
          longitude_map: settings.longitude_map ?? null,
          latitude_address: settings.latitude_address ?? null,
          longitude_address: settings.longitude_address ?? null,
          street: settings.street || "",
          number: settings.number || "",
          neighborhood: settings.neighborhood || "",
          city: settings.city || "",
          state: settings.state || "",
          cep: settings.cep || "",
          cover_image_url: settings.cover_image_url || ""
        }
      };
    });

    res.json(mergedClinics);
  } catch (error: any) {
    console.error("Erro ao buscar clínicas:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      cause: {
        code: error?.cause?.code,
        errno: error?.cause?.errno,
        address: error?.cause?.address,
        port: error?.cause?.port
      },
      stack: error?.stack
    });
    res.status(500).json({ message: "Erro ao buscar clínicas." });
  }
}

// Detalhes completos
export async function getClinicDetails(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const clinic = await getFullClinicById(id);
    if (!clinic || (clinic as any)?.error) {
      return res.status(404).json({ error: "Clínica não encontrada" });
    }
    res.json(clinic);
  } catch (error: any) {
    console.error("Erro ao buscar detalhes da clínica:", {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      cause: {
        code: error?.cause?.code,
        errno: error?.cause?.errno,
        address: error?.cause?.address,
        port: error?.cause?.port
      },
      stack: error?.stack
    });
    res.status(500).json({ error: "Erro ao buscar detalhes da clínica." });
  }
}