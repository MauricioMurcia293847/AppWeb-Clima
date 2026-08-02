import { Component, type ErrorInfo, type ReactNode } from "react";
import { GlobeFallback } from "./GlobeFallback";

type GlobeErrorBoundaryProps = {
  children: ReactNode;
};

type GlobeErrorBoundaryState = {
  hasError: boolean;
};

// Un error de Three.js no debe desmontar el dashboard completo. El limite se
// mantiene alrededor de la escena para que el resto de la app siga operativo.
export class GlobeErrorBoundary extends Component<
  GlobeErrorBoundaryProps,
  GlobeErrorBoundaryState
> {
  state: GlobeErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): GlobeErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("No se pudo iniciar el globo 3D.", error, info);
  }

  render() {
    if (this.state.hasError) return <GlobeFallback reason="error" />;
    return this.props.children;
  }
}
