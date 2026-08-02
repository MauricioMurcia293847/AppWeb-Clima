const motionPreferenceKey = "appweb-clima:reduce-motion";

export function getReduceMotionPreference(): boolean {
  try {
    const savedPreference = window.localStorage.getItem(motionPreferenceKey);
    if (savedPreference === "true") return true;
    if (savedPreference === "false") return false;

    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

export function saveReduceMotionPreference(value: boolean) {
  try {
    // Guardamos ambos valores para distinguir una eleccion explicita de la
    // ausencia de preferencia, que debe seguir la configuracion del sistema.
    window.localStorage.setItem(motionPreferenceKey, String(value));
  } catch {
    // La preferencia sigue activa durante la sesion aunque storage este bloqueado.
  }
}

export function clearMotionPreference() {
  try {
    window.localStorage.removeItem(motionPreferenceKey);
  } catch {
    // El borrado visual puede continuar aunque storage este bloqueado.
  }
}
