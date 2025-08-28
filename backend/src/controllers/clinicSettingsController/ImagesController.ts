import { Request, Response } from 'express';
import { supabase } from '../../supabaseClient';
import { removeImage } from '../../services/storageService';

export const update = async (req: Request, res: Response) => {
  const { removeCoverImage, existingGalleryUrls, galleryUrlsToRemove, clinicId } = req.body;
  const clinic_id = Number(req.params.clinicId ?? clinicId);

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const newCoverImageFile = files?.coverImage?.[0];
  const newGalleryImageFiles = files?.galleryImages || [];

  try {
    const { data: currentSettingsArr, error: settingsError } = await supabase
      .from('clinic_settings')
      .select('*')
      .eq('clinic_id', clinic_id)
      .maybeSingle();

    if (settingsError) throw settingsError;
    const currentSettings = currentSettingsArr || {};

    let newCoverImageUrl: string | null | undefined = currentSettings?.cover_image_url;
    if (removeCoverImage === 'true' && currentSettings?.cover_image_url) {
      await removeImage(currentSettings.cover_image_url);
      newCoverImageUrl = null;
    }
    if (newCoverImageFile) {
      if (currentSettings?.cover_image_url && currentSettings.cover_image_url !== newCoverImageFile.filename) {
        await removeImage(currentSettings.cover_image_url);
      }
      newCoverImageUrl = newCoverImageFile.filename;
    }

    let currentGalleryUrls: string[] = [];
    if (currentSettings?.gallery_image_urls) {
      try {
        currentGalleryUrls = Array.isArray(currentSettings.gallery_image_urls)
          ? currentSettings.gallery_image_urls
          : JSON.parse(currentSettings.gallery_image_urls);
      } catch {
        currentGalleryUrls = [];
      }
    }
    const galleryUrlsToRemoveArr: string[] = galleryUrlsToRemove
      ? (typeof galleryUrlsToRemove === 'string' ? JSON.parse(galleryUrlsToRemove) : galleryUrlsToRemove)
      : [];
    const existingGalleryUrlsArr: string[] = existingGalleryUrls
      ? (typeof existingGalleryUrls === 'string' ? JSON.parse(existingGalleryUrls) : existingGalleryUrls)
      : [];
    for (const urlToRemove of galleryUrlsToRemoveArr) {
      if (currentGalleryUrls.includes(urlToRemove)) {
        await removeImage(urlToRemove);
      }
    }
    const finalGalleryUrlsSet = new Set<string>();
    existingGalleryUrlsArr.forEach(url => {
      if (!galleryUrlsToRemoveArr.includes(url)) finalGalleryUrlsSet.add(url);
    });
    newGalleryImageFiles.forEach(file => {
      finalGalleryUrlsSet.add(file.filename);
    });
    const updatedGalleryUrls = Array.from(finalGalleryUrlsSet);

    const dataToSave: any = {
      cover_image_url: newCoverImageUrl,
      gallery_image_urls: JSON.stringify(updatedGalleryUrls),
      updated_at: new Date().toISOString()
    };

    const { data: updatedArr, error } = await supabase
      .from('clinic_settings')
      .update(dataToSave)
      .eq('clinic_id', clinic_id)
      .select('*');

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    const record = updatedArr && updatedArr.length > 0 ? updatedArr[0] : null;

    return res.json({ info: record });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
