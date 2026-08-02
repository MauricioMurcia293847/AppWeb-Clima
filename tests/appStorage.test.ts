import { beforeEach, describe, expect, it } from "vitest";
import { clearAppLocalData } from "../src/services/appStorage";

describe("limpieza local de AppWeb Clima", () => {
  beforeEach(() => window.localStorage.clear());

  it("elimina sus tres claves y conserva cualquier clave ajena", () => {
    window.localStorage.setItem("appweb-clima:recent-locations", "[]");
    window.localStorage.setItem("appweb-clima:favorite-locations", "[]");
    window.localStorage.setItem("appweb-clima:reduce-motion", "true");
    window.localStorage.setItem("otra-app:sesion", "intacta");

    clearAppLocalData();

    expect(window.localStorage.getItem("appweb-clima:recent-locations")).toBeNull();
    expect(window.localStorage.getItem("appweb-clima:favorite-locations")).toBeNull();
    expect(window.localStorage.getItem("appweb-clima:reduce-motion")).toBeNull();
    expect(window.localStorage.getItem("otra-app:sesion")).toBe("intacta");
  });
});
