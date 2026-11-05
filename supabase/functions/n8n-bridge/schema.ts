import { z } from "https://esm.sh/zod@3.23.8";
import { followupStatuses } from "./validation.ts";

const caseId = z.string().uuid();
const status = z.enum(followupStatuses);
const plainText = (max: number) => z.string().trim().min(1).max(max).refine(value => !value.includes("\u0000"));

export const bridgeSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("get_case"), case_id: caseId }).strict(),
  z.object({ action: z.literal("set_followup"), case_id: caseId, status,
    question: plainText(5000), question_case: plainText(5000) }).strict(),
  z.object({ action: z.literal("find_case_by_phone"), phone: z.string().regex(/^\d{7,15}$/) }).strict(),
  z.object({ action: z.literal("record_reply"), case_id: caseId, remark: plainText(5000), status }).strict(),
  z.object({ action: z.literal("notify_team"),
    subject: plainText(200).refine(value => !/[\r\n]/.test(value)), body: plainText(5000) }).strict(),
]);