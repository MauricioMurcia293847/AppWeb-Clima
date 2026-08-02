// Comprueba WebGL antes de descargar y montar la escena 3D. Algunos navegadores
// exponen la API pero no pueden crear un contexto por restricciones de hardware.
export function supportsWebGL(): boolean {
  if (typeof document === "undefined") return false;

  const canvas = document.createElement("canvas");

  try {
    const context =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");

    return context !== null;
  } catch {
    return false;
  }
}
