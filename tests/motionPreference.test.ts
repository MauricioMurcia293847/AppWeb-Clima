import { beforeEach, describe, expect, it } from "vitest";
import {
  clearMotionPreference,
  getReduceMotionPreference,
  saveReduceMotionPreference,
} from "../src/services/motionPreference";

describe("preferencia de movimiento", () => {
  beforeEach(() => window.localStorage.clear());

  it("empieza desactivada cuando no existe una seleccion", () => {
    expect(getReduceMotionPreference()).toBe(false);
  });

  it("persiste la seleccion del usuario", () => {
    saveReduceMotionPreference(true);
    expect(getReduceMotionPreference()).toBe(true);
  });

  it("elimina la preferencia y vuelve al valor predeterminado", () => {
    saveReduceMotionPreference(true);
    clearMotionPreference();

    expect(getReduceMotionPreference()).toBe(false);
    expect(window.localStorage.getItem("appweb-clima:reduce-motion")).toBeNull();
  });
});
