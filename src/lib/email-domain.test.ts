import { describe, test, expect } from "bun:test";
import { z } from "zod";
import { hasRecognizedEmailDomain } from "../../supabase/functions/_shared/email-domain";

const emailSchema = z.string().trim().email().max(255).refine(hasRecognizedEmailDomain);

describe("Application email domain validation", () => {
  test("rejects the reported gmail.con typo", () => {
    expect(emailSchema.safeParse("viktor.daskalov28@gmail.con").success).toBe(false);
  });
  test("accepts .com addresses", () => {
    expect(emailSchema.safeParse("viktor.daskalov28@gmail.com").success).toBe(true);
  });
  test("accepts .ch addresses", () => {
    expect(emailSchema.safeParse("client@example.ch").success).toBe(true);
  });
  test("accepts other recognized extensions, including compound country domains", () => {
    for (const ending of ["fr", "de", "edu", "org", "co.uk", "com.au", "swiss", "technology"]) {
      expect(emailSchema.safeParse(`client@example.${ending}`).success).toBe(true);
    }
  });
  test("rejects nonexistent endings without auto-correcting", () => {
    for (const ending of ["cmo", "commm", "invalidending"]) {
      expect(emailSchema.safeParse(`client@example.${ending}`).success).toBe(false);
    }
  });
  test("retains syntax validation", () => {
    for (const email of ["client", "client@", "client@gmail", "client@@gmail.com"]) {
      expect(emailSchema.safeParse(email).success).toBe(false);
    }
  });
});