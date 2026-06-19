import { beforeEach, describe, expect, it } from "vitest";
import {
  addRecentLocation,
  getFavoriteLocations,
  getRecentLocations,
  toggleFavoriteLocation,
} from "../src/services/locationStorage";

describe("locationStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("guarda busquedas recientes sin duplicados y con limite", () => {
    addRecentLocation("Madrid");
    addRecentLocation("Tokio");
    addRecentLocation("madrid");
    addRecentLocation("Paris");
    addRecentLocation("Roma");
    addRecentLocation("Lima");
    addRecentLocation("Bogota");

    expect(getRecentLocations()).toEqual([
      "Bogota",
      "Lima",
      "Roma",
      "Paris",
      "madrid",
      "Tokio",
    ]);
  });

  it("activa y desactiva favoritos", () => {
    expect(toggleFavoriteLocation("Madrid")).toEqual(["Madrid"]);
    expect(getFavoriteLocations()).toEqual(["Madrid"]);
    expect(toggleFavoriteLocation("madrid")).toEqual([]);
  });
});
