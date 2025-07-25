export const GOOGLE_MAP_LIBRARIES = ["marker"];
export const GOOGLE_MAP_ID = process.env.REACT_APP_GOOGLE_MAPS_MAP_ID || "";
export const GOOGLE_MAPS_LOADER_OPTIONS = {
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  libraries: GOOGLE_MAP_LIBRARIES as any,
  mapIds: [GOOGLE_MAP_ID], // mesmo que esteja vazio!
};