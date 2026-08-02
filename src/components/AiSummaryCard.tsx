import { Bot, MessageCircle, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { WeatherDashboardData, WeatherSummary } from "../types/weather";
import { buildFriendlyTips, buildLocalGuidance } from "../services/weatherGuidance";

type AiSummaryCardProps = {
  isLoading: boolean;
  reduceMotion: boolean;
  summary: WeatherSummary | null;
  weather: WeatherDashboardData;
};

// Seccion persistente: primero ofrece una guia local y, cuando el backend
// entrega un resumen valido, la sustituye por el contenido de IA.
export function AiSummaryCard({
  isLoading,
  reduceMotion,
  summary,
  weather,
}: AiSummaryCardProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [adviceIndex, setAdviceIndex] = useState(0);
  const localGuidance = buildLocalGuidance(weather);
  const hasBackendSummary = Boolean(summary && !summary.degraded);
  const displayedLines = hasBackendSummary ? summary!.summaryLines : localGuidance.summaryLines;
  const friendlyTips = buildFriendlyTips(weather);
  const backendRecommendations = summary?.recommendations?.length
    ? summary.recommendations
    : summary?.recommendation
      ? [summary.recommendation]
      : [];
  const adviceOptions = hasBackendSummary
    ? backendRecommendations
    : friendlyTips;
  const recommendation = adviceOptions[adviceIndex % adviceOptions.length];
  const visibleAdviceNumber = (adviceIndex % adviceOptions.length) + 1;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const systemReduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion || systemReduceMotion || typeof IntersectionObserver === "undefined") return;

    let cancelled = false;
    let revertAnimations: (() => void) | undefined;
    section.classList.add("is-animation-ready");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        // Anime.js se descarga al entrar en pantalla. createScope limita los
        // selectores a esta seccion y revierte sus estilos al desmontar React.
        void import("animejs")
          .then(({ animate, createScope, createTimeline, spring, stagger }) => {
            if (cancelled) return;

            const scope = createScope({ root: section }).add(() => {
              createTimeline({ defaults: { duration: 620, ease: "out(4)" } })
                .add(".ai-guide-robot", {
                  opacity: [0, 1],
                  rotate: ["-8deg", "0deg"],
                  scale: [0.72, 1],
                  y: ["3rem", "0rem"],
                  ease: spring({ bounce: 0.38 }),
                })
                .add(
                  ".ai-guide-copy > *",
                  {
                    delay: stagger(70),
                    opacity: [0, 1],
                    y: ["1.1rem", "0rem"],
                  },
                  "-=430",
                )
                .add(
                  ".ai-message",
                  {
                    delay: stagger(90),
                    opacity: [0, 1],
                    x: ["1rem", "0rem"],
                  },
                  "-=360",
                );

              animate(".robot-character", {
                loop: true,
                y: [
                  { to: "-0.35rem", duration: 900, ease: "inOut(2)" },
                  { to: "0rem", duration: 900, ease: "inOut(2)" },
                ],
              });
              animate(".robot-signal-ring", {
                delay: stagger(420),
                duration: 1800,
                ease: "out(3)",
                loop: true,
                opacity: [0.62, 0],
                scale: [0.82, 1.18],
              });
            });

            revertAnimations = () => scope.revert();
          })
          .catch(() => section.classList.remove("is-animation-ready"));
      },
      { threshold: 0.24 },
    );

    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      revertAnimations?.();
    };
  }, [reduceMotion]);

  function showAnotherAdvice() {
    setAdviceIndex((current) => (current + 1) % adviceOptions.length);

    const section = sectionRef.current;
    if (reduceMotion || !section || typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // El gesto se ejecuta despues del render para sincronizar el saludo del
    // robot con la aparicion del nuevo consejo.
    window.requestAnimationFrame(() => {
      void import("animejs").then(({ animate, stagger }) => {
        animate(section.querySelectorAll(".robot-arm"), {
          delay: stagger(80),
          duration: 720,
          ease: "out(4)",
          rotate: ["0deg", "-38deg", "18deg", "-28deg", "0deg"],
        });
        const character = section.querySelector(".robot-character");
        const advice = section.querySelector(".ai-guide-recommendation");

        if (character) {
          animate(character, {
            duration: 620,
            ease: "out(4)",
            scale: [1, 1.06, 1],
          });
        }
        if (advice) {
          animate(advice, {
            duration: 480,
            ease: "out(4)",
            opacity: [0.35, 1],
            x: ["0.7rem", "0rem"],
          });
        }
      });
    });
  }

  return (
    <section
      aria-busy={isLoading}
      aria-labelledby="ai-guide-title"
      className="ai-weather-guide"
      ref={sectionRef}
    >
      <button
        className="ai-guide-visual"
        disabled={isLoading}
        onClick={showAnotherAdvice}
        type="button"
      >
        <span aria-hidden="true" className="robot-signal-ring" />
        <span aria-hidden="true" className="robot-signal-ring" />
        <span className="ai-guide-robot">
          <span aria-hidden="true" className="robot-character">
            <span className="robot-antenna"><i /></span>
            <span className="robot-head">
              <span className="robot-status-light" />
              <Bot className="ai-robot-icon" strokeWidth={1.55} />
            </span>
            <span className="robot-arm robot-arm-left" />
            <span className="robot-torso"><Sparkles /></span>
            <span className="robot-arm robot-arm-right" />
            <span className="robot-legs"><i /><i /></span>
            <span className="robot-shadow" />
          </span>
        </span>
        <span className="robot-interaction-label">
          <MessageCircle aria-hidden="true" />
          Otro consejo
        </span>
      </button>

      <div className="ai-guide-copy">
        <span className="section-kicker ai-guide-kicker">
          <Sparkles aria-hidden="true" />
          Asistente meteorológico
        </span>
        <h2 id="ai-guide-title">Tu guía inteligente para salir preparado</h2>
        <p className="ai-guide-intro">
          Analiza temperatura, lluvia, viento y sensación térmica de {weather.location}.
        </p>

        {isLoading ? (
          <div className="ai-guide-loading" role="status">
            <span aria-hidden="true" />
            Preparando una recomendación con el clima actual...
          </div>
        ) : (
          <>
            <ul className="ai-message-list">
              {displayedLines.map((line) => (
                <li className="ai-message" key={line}>{line}</li>
              ))}
            </ul>
            <p className="ai-guide-recommendation" id="ai-current-advice">
              <strong>
                {hasBackendSummary
                  ? `Consejo de Gemini ${visibleAdviceNumber}/${adviceOptions.length}`
                  : "Recomendación"}
              </strong>
              <span aria-live="polite">{recommendation}</span>
            </p>
          </>
        )}

        <small className="ai-guide-source">
          {hasBackendSummary
            ? "Consejos generados por Gemini con el clima actual."
            : "Consejo alternativo basado en los datos meteorológicos visibles."}
        </small>
      </div>
    </section>
  );
}
