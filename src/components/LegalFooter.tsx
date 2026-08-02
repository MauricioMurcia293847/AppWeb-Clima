import { Activity, CircleAlert, Info, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type LegalView = "clear-data" | "credits" | "privacy" | "responsible" | null;

type LegalFooterProps = {
  onClearLocalData: () => void;
  onReduceMotionChange: (value: boolean) => void;
  reduceMotion: boolean;
};

export function LegalFooter({
  onClearLocalData,
  onReduceMotionChange,
  reduceMotion,
}: LegalFooterProps) {
  const [activeView, setActiveView] = useState<LegalView>(null);
  const [clearStatus, setClearStatus] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (activeView && !dialog.open) dialog.showModal();
    if (!activeView && dialog.open) dialog.close();
  }, [activeView]);

  function confirmClearLocalData() {
    onClearLocalData();
    setClearStatus("Datos locales borrados correctamente.");
    setActiveView("privacy");
  }

  return (
    <footer className="app-footer">
      <div className="footer-identity">
        <strong>© 2026 AppWeb Clima</strong>
        <small>Todos los derechos reservados.</small>
      </div>

      <nav aria-label="Información legal" className="footer-links">
        <button onClick={() => setActiveView("credits")} type="button">
          <Info aria-hidden="true" />
          Créditos
        </button>
        <button onClick={() => setActiveView("privacy")} type="button">
          <ShieldCheck aria-hidden="true" />
          Privacidad
        </button>
        <button onClick={() => setActiveView("responsible")} type="button">
          <CircleAlert aria-hidden="true" />
          Uso responsable
        </button>
      </nav>

      <label className="motion-preference">
        <span className="motion-preference-label">
          <Activity aria-hidden="true" />
          Reducir animaciones
        </span>
        <input
          checked={reduceMotion}
          onChange={(event) => onReduceMotionChange(event.target.checked)}
          type="checkbox"
        />
        <span aria-hidden="true" className="motion-toggle-track"><i /></span>
      </label>

      <dialog
        aria-labelledby="legal-dialog-title"
        className="legal-dialog"
        onCancel={() => setActiveView(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setActiveView(null);
        }}
        ref={dialogRef}
      >
        <button
          aria-label="Cerrar"
          className="legal-dialog-close"
          onClick={() => setActiveView(null)}
          type="button"
        >
          <X aria-hidden="true" />
        </button>

        {activeView === "credits" ? (
          <div className="legal-dialog-content">
            <span>Acerca del proyecto</span>
            <h2 id="legal-dialog-title">Créditos</h2>
            <p>Diseño y desarrollo: Mauricio Murcia.</p>
            <p>Datos meteorológicos proporcionados por Open-Meteo.</p>
            <p>Experiencia visual construida con React Globe GL, Three.js y Anime.js.</p>
          </div>
        ) : activeView === "privacy" ? (
          <div className="legal-dialog-content">
            <span>Uso responsable de datos</span>
            <h2 id="legal-dialog-title">Privacidad</h2>
            <p>
              Favoritos y búsquedas recientes se guardan solamente en el almacenamiento
              local de tu navegador.
            </p>
            <p>
              La ubicación se solicita únicamente con tu permiso y se envía a nuestra API
              para consultar el clima. No se almacena en una base de datos.
            </p>
            <p>
              Cuando el asistente de IA está habilitado, los datos meteorológicos pueden
              procesarse temporalmente para generar la recomendación mostrada.
            </p>
            <div className="local-data-control">
              <strong>Datos guardados en este dispositivo</strong>
              <p>
                Puedes eliminar favoritos, búsquedas recientes y tu preferencia de
                movimiento sin afectar datos de otros sitios.
              </p>
              <button
                className="legal-danger-action"
                onClick={() => {
                  setClearStatus("");
                  setActiveView("clear-data");
                }}
                type="button"
              >
                Borrar datos locales
              </button>
              <p aria-live="polite" className="local-data-status" role="status">
                {clearStatus}
              </p>
            </div>
          </div>
        ) : activeView === "responsible" ? (
          <div className="legal-dialog-content">
            <span>Información meteorológica</span>
            <h2 id="legal-dialog-title">Uso responsable</h2>
            <p>
              AppWeb Clima ofrece información orientativa basada en modelos
              meteorológicos. Las condiciones pueden cambiar y los datos pueden tener
              retrasos o diferencias entre modelos.
            </p>
            <p>
              Para alertas, emergencias y condiciones severas, consulta siempre a las
              autoridades meteorológicas y de protección civil de tu localidad.
            </p>
            <p>
              Las recomendaciones del asistente son sugerencias generales y no
              sustituyen avisos oficiales ni asesoría profesional.
            </p>
          </div>
        ) : (
          <div className="legal-dialog-content">
            <span>Confirmar limpieza</span>
            <h2 id="legal-dialog-title">¿Borrar los datos locales?</h2>
            <p>
              Se eliminarán tus favoritos, búsquedas recientes y preferencia de
              movimiento. Esta acción no se puede deshacer.
            </p>
            <div className="legal-confirm-actions">
              <button
                autoFocus
                className="legal-secondary-action"
                onClick={() => setActiveView("privacy")}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="legal-danger-action"
                onClick={confirmClearLocalData}
                type="button"
              >
                Sí, borrar
              </button>
            </div>
          </div>
        )}
      </dialog>
    </footer>
  );
}
