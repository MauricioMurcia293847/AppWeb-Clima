import { clearSavedLocations } from "./locationStorage";
import { clearMotionPreference } from "./motionPreference";

// Coordina exclusivamente las claves propiedad de AppWeb Clima. Nunca usa
// localStorage.clear(), porque eso podria borrar datos ajenos del mismo origen.
export function clearAppLocalData() {
  clearSavedLocations();
  clearMotionPreference();
}
