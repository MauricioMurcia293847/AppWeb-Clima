import { describe, expect, it } from "vitest";
import { escapeHtml } from "../src/utils/escapeHtml";

describe("escapeHtml", () => {
  it("convierte markup externo en texto seguro para tooltips", () => {
    expect(escapeHtml(`<script data-city='x'>& "alert"</script>`)).toBe(
      "&lt;script data-city=&#39;x&#39;&gt;&amp; &quot;alert&quot;&lt;/script&gt;",
    );
  });
});
