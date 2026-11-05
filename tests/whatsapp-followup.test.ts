import { describe, expect, test } from "bun:test";
import { hasWhatsappConsent } from "../supabase/functions/_shared/whatsapp-consent";
import { followupStatuses, secretsMatch } from "../supabase/functions/n8n-bridge/validation";

describe("WhatsApp follow-up rules", () => {
  test("consent is off by default", () => { expect(hasWhatsappConsent(undefined)).toBe(false); });
  test("declining consent remains valid", () => { expect(hasWhatsappConsent(false)).toBe(false); });
  test("only explicit true authorizes contact", () => {
    expect(hasWhatsappConsent(true)).toBe(true);
    expect(hasWhatsappConsent("true")).toBe(false);
  });
  test("status vocabulary is restricted to the three requested statuses", () => {
    expect([...followupStatuses]).toEqual(["question_sent", "answered", "needs_human"]);
  });
  test("bridge rejects absent or incorrect shared secrets", async () => {
    expect(await secretsMatch(null, "unit-test-only")).toBe(false);
    expect(await secretsMatch("unit-test-only", undefined)).toBe(false);
    expect(await secretsMatch("incorrect-test-value", "unit-test-only")).toBe(false);
  });
  test("bridge accepts an exact shared-secret match", async () => {
    expect(await secretsMatch("unit-test-only", "unit-test-only")).toBe(true);
  });
});