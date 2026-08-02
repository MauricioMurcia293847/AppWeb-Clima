// Los tooltips de globe.gl se insertan como HTML. Escapar el contenido evita
// que nombres recibidos desde un proveedor externo se interpreten como markup.
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}
