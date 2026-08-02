const motionPreferenceKey = "appweb-clima:reduce-motion";

export function getReduceMotionPreference(): boolean {
  try {
    return window.localStorage.getItem(motionPreferenceKey) === "true";
  } catch {
    return false;
  }
}

export function saveReduceMotionPreference(value: boolean) {
  try {
    if (value) {
      window.localStorage.setItem(motionPreferenceKey, "true");
    } else {
      window.localStorage.removeItem(motionPreferenceKey);
    }
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
