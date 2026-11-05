// Only an explicit boolean true authorizes WhatsApp application contact.
export function hasWhatsappConsent(value: unknown): boolean {
  return value === true;
}